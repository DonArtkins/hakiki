# Eval report

Mode: rules. Cases: 14 (seed set; F08 grows this to 60+ with a held-out split).

| Case | Expected | Predicted | Expected type | Predicted type | Risk ok | ms |
|---|---|---|---|---|---|---|
| ev01 | high | high | fake_reversal | fake_reversal | yes | 27 |
| ev02 | high | suspicious | fake_reversal | fake_reversal | yes | 3 |
| ev03 | high | high | fake_customer_care | fake_customer_care | yes | 5 |
| ev04 | high | suspicious | cashback_link | cashback_link | yes | 6 |
| ev05 | high | suspicious | fake_job | fake_job | yes | 3 |
| ev06 | high | suspicious | investment_ponzi | investment_ponzi | yes | 3 |
| ev07 | high | suspicious | loan_app_fee | loan_app_fee | yes | 2 |
| ev08 | high | suspicious | fake_gov_alert | cashback_link | yes | 3 |
| ev09 | suspicious | suspicious | courier_deposit | cashback_link | yes | 2 |
| ev10 | suspicious | suspicious | cashback_link | cashback_link | yes | 2 |
| ev11 | safe | unclear | - | - | yes | 1 |
| ev12 | safe | unclear | - | - | yes | 2 |
| ev13 | safe | unclear | - | - | yes | 1 |
| ev14 | safe | unclear | - | - | yes | 1 |

- Scam risk recall (high/suspicious): 100.0% overall risk agreement
- Type accuracy on scams: 80.0%
- Benign false-high: 0/4
