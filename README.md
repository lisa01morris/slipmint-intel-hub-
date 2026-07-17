# SlipMint Market Intelligence Hub 🚀

An institutional-grade real estate analytics engine and public showcase platform. This system automatically runs predictive analytics modeling on frontier markets, generates deep-dive market intelligence reports, and pushes them seamlessly to a public web interface.

---

## 🏗️ System Architecture

- **Backend Automation Factory:** Python engine utilizing `google-genai` and `gemini-2.5-flash` to process target locations.
- **Cloud Orchestration:** GitHub Actions workflow executing autonomously on a weekly cron schedule or via manual `workflow_dispatch`.
- **Data & Layer:** Supabase REST api endpoint handling automated upserts with duplicate resolution logic.
- **Frontend Presentation Layer:** Next.js dynamic routing showing zero-login public previews for clients.

---

## ⚙️ Core Operations

Whenever a change is committed to the target profile configurations, the cloud chain reaction triggers automatically:
1. **The Factory Fires:** GitHub Action wakes up an Ubuntu runner.
2. **The AI Manufactures:** Gemini builds market deep dives, population density vectors, and infrastructure mappings.
3. **The Infrastructure Updates:** Data is pushed live to the platform natively.
4. **The Gateway Monitizes:** Integrated Whop checkout links redirect global users back to the verified target profiles.
