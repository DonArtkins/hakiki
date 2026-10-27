import { boolean, integer, jsonb, pgTable, real, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

// Mirrors docs/05 DDL name-for-name (SDR-007). No message bodies or images in any table.
export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  locale: text("locale").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  deviceHash: text("device_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const identities = pgTable("identities", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // telegram | email
  externalId: text("external_id").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.provider, t.externalId)]);

export const linkCodes = pgTable("link_codes", {
  code: text("code").primaryKey(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  purpose: text("purpose").notNull(), // telegram_link | guardian_invite
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export const guardianLinks = pgTable("guardian_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  wardId: uuid("ward_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  guardianId: uuid("guardian_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"), // pending | active | revoked
  shareLevel: text("share_level").notNull().default("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.wardId, t.guardianId)]);

export const scamTypes = pgTable("scam_types", {
  id: text("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameSw: text("name_sw").notNull(),
  playbook: jsonb("playbook").notNull(),
});

export const checks = pgTable("checks", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(), // web | telegram | share
  inputKind: text("input_kind").notNull(), // text | image | text_image | audio
  risk: text("risk").notNull(), // safe | suspicious | high | unclear
  scamTypeId: text("scam_type_id").references(() => scamTypes.id),
  confidence: real("confidence").notNull(),
  reasons: jsonb("reasons").notNull(),
  nextSteps: jsonb("next_steps").notNull(),
  ruleFindings: jsonb("rule_findings").notNull(),
  language: text("language").notNull(),
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const indicators = pgTable("indicators", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // phone | url_host | mpesa_code_pattern | sender | paybill_till
  hash: text("hash").notNull(),
  reportCount: integer("report_count").notNull().default(0),
  deviceCount: integer("device_count").notNull().default(0),
  firstSeen: timestamp("first_seen", { withTimezone: true }).notNull().defaultNow(),
  lastSeen: timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.kind, t.hash)]);

export const checkIndicators = pgTable("check_indicators", {
  checkId: uuid("check_id").notNull().references(() => checks.id, { onDelete: "cascade" }),
  indicatorId: uuid("indicator_id").notNull().references(() => indicators.id, { onDelete: "cascade" }),
});

export const indicatorDevices = pgTable("indicator_devices", {
  indicatorId: uuid("indicator_id").notNull().references(() => indicators.id, { onDelete: "cascade" }),
  deviceHash: text("device_hash").notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  checkId: uuid("check_id").notNull().references(() => checks.id, { onDelete: "cascade" }),
  verdictFeedback: text("verdict_feedback").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shares = pgTable("shares", {
  id: uuid("id").defaultRandom().primaryKey(),
  checkId: uuid("check_id").notNull().references(() => checks.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  cardPath: text("card_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scamAlerts = pgTable("scam_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  scamTypeId: text("scam_type_id").notNull().references(() => scamTypes.id),
  headlineEn: text("headline_en").notNull(),
  headlineSw: text("headline_sw").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  checkId: uuid("check_id").notNull().references(() => checks.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(), // telegram | inbox
  status: text("status").notNull().default("pending"), // pending | sent | failed | read
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const modelCalls = pgTable("model_calls", {
  id: uuid("id").defaultRandom().primaryKey(),
  checkId: uuid("check_id").references(() => checks.id, { onDelete: "set null" }),
  purpose: text("purpose").notNull(), // extract | agent | repair | sam | image | voice
  model: text("model").notNull(),
  inTokens: integer("in_tokens"),
  outTokens: integer("out_tokens"),
  cachedTokens: integer("cached_tokens"),
  costUsd: real("cost_usd").notNull().default(0),
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const evalCases = pgTable("eval_cases", {
  id: text("id").primaryKey(),
  inputKind: text("input_kind").notNull(),
  label: text("label").notNull(),
  scamTypeId: text("scam_type_id"),
  locale: text("locale").notNull().default("en"),
  benign: boolean("benign").notNull().default(false),
});

export const evalRuns = pgTable("eval_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  model: text("model").notNull(),
  gitSha: text("git_sha"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  summary: jsonb("summary"),
});

export const evalResults = pgTable("eval_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id").notNull().references(() => evalRuns.id, { onDelete: "cascade" }),
  caseId: text("case_id").notNull().references(() => evalCases.id),
  predictedRisk: text("predicted_risk"),
  predictedType: text("predicted_type"),
  correct: boolean("correct"),
  latencyMs: integer("latency_ms"),
});
