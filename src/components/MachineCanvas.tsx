"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MachineState } from "./machine-state";
import { ringSpeed, stageIntensity } from "@/lib/motion";

const COLORS: Record<string, number> = { brand: 0x0f6b4f, safe: 0x1e8e5a, suspicious: 0xb7791f, high: 0xc0392b, unclear: 0x5b6b8c, error: 0xc0392b };

export function MachineCanvas({ state, fallback, label }: { state: MachineState; fallback: ReactNode; label: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false; let cleanup = () => undefined;
    (async () => {
      try {
        const THREE = await import("three");
        if (disposed || !mountRef.current) return;
        const mount = mountRef.current;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 100);
        camera.position.set(0, 0, 7);
        const coreMat = new THREE.MeshStandardMaterial({ color: COLORS.brand, roughness: 0.35, metalness: 0.1 });
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), coreMat);
        scene.add(core);
        const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.18, 1), new THREE.MeshBasicMaterial({ color: 0x0f6b4f, wireframe: true, transparent: true, opacity: 0 }));
        scene.add(wire);
        const rings: InstanceType<typeof THREE.Mesh>[] = [];
        for (let i = 0; i < 2; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9 + i * 0.45, 0.02, 8, 72), new THREE.MeshBasicMaterial({ color: 0x9db0a5, transparent: true, opacity: 0.55 }));
          ring.rotation.x = Math.PI / 2.4 + i * 0.35;
          scene.add(ring); rings.push(ring);
        }
        const nodes: InstanceType<typeof THREE.Mesh>[] = [];
        for (let i = 0; i < 3; i++) {
          const n = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), new THREE.MeshStandardMaterial({ color: 0x5b6b62, roughness: 0.4 }));
          const a = (i / 3) * Math.PI * 2; n.position.set(Math.cos(a) * 2.2, Math.sin(a) * 1.4, 0); scene.add(n); nodes.push(n);
          const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), n.position.clone()]);
          scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x9db0a5 })));
        }
        scene.add(new THREE.AmbientLight(0xffffff, 1.4));
        const light = new THREE.DirectionalLight(0xffffff, 2); light.position.set(3, 4, 5); scene.add(light);
        const onResize = () => { const w = mount.clientWidth, h = Math.max(1, mount.clientHeight); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(w, h); };
        window.addEventListener("resize", onResize);
        let raf = 0; let frame = 0;
        const tick = () => {
          frame++;
          const s = stateRef.current;
          const active = s.stage !== "idle" && s.stage !== "error";
          const hidden = document.hidden;
          const idleSkip = s.stage === "idle" && frame % 30 !== 0;
          if (!hidden && !idleSkip) {
            const target = s.risk ? COLORS[s.risk] : s.stage === "error" ? COLORS.error : COLORS.brand;
            coreMat.color.setHex(target);
            (wire.material as InstanceType<typeof THREE.MeshBasicMaterial>).color.setHex(target);
            (wire.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = s.stage === "verdict" ? 0.85 : 0;
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const speed = s.stage === "idle" || reduced ? 0 : 0.008;
            core.rotation.y += speed; core.rotation.x += speed * 0.6;
            wire.rotation.y -= speed * 0.7;
            const rs = ringSpeed(s.stage, reduced);
            rings.forEach((r, i) => { r.rotation.z += rs * (i === 0 ? 1 : -0.7); });
            const pulse = active && !reduced ? 1 + Math.sin(Date.now() / 280) * 0.08 : 1;
            core.scale.setScalar(pulse);
            const inten = stageIntensity(s.stage);
            nodes.forEach((n, i) => { const on = (s.stage === "extracting" && i === 0) || (s.stage === "rules" && i === 1) || (s.stage === "reasoning" && i === 2) || s.stage === "verdict"; (n.material as InstanceType<typeof THREE.MeshStandardMaterial>).color.setHex(on ? target : 0x5b6b62); const sc = on ? 1 + inten * 0.35 : 1; n.scale.setScalar(sc); });
            renderer.render(scene, camera);
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
        cleanup = () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); scene.traverse((o) => { const mesh = o as InstanceType<typeof THREE.Mesh>; if (mesh.geometry) mesh.geometry.dispose(); const mat = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial> | undefined; if (mat) mat.dispose(); }); renderer.dispose(); if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement); };
      } catch { if (!disposed) setFailed(true); }
    })();
    return () => { disposed = true; cleanup(); };
  }, []);

  if (failed) return <>{fallback}</>;
  return <div ref={mountRef} className="machine-canvas" role="img" aria-label={label} data-stage={state.stage} />;
}
