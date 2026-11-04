# Nations Trust Bank — Relationship 360

Executive Customer Visit Intelligence & Next Best Product Portal built for **Nations Trust Bank** (`LKR Mn`).

## Key Capabilities
- **Brand Identity**: Styled in Nations Trust Bank Cerulean Blue (`#0076BE`) and Vibrant Magenta-Pink (`#EC008C`) with the official ribbon logo bundled locally.
- **Customer & Director Privacy**: Displays customer profiles and connected director relationships without exposing CIF numbers on the visual profile cards, while supporting instant search by company name, director name, sector, or CIF code.
- **Strictly Factual Financial Engine**:
  - Reconciles all 17 primary customers (`CIF_main.csv`) and connected director profiles.
  - Spot-check verified (`Central Finance Company PLC`: Assets `5,216.88 Mn`, Liabilities `161.33 Mn`, YTD Revenue `143.26 Mn`, Limit `5,700.00 Mn`; `Haycarb PLC`: Assets `95.87 Mn`, Liabilities `11.71 Mn`, YTD Revenue `4.56 Mn`, Limit `1,458.13 Mn`; `L. G. Farm`: Assets `1.09 Mn`, Liabilities `56.69 Mn`, YTD Revenue `2.35 Mn`, Limit `144.52 Mn`).
  - No Relationship Manager or Servicing Branch fields are shown.
- **Phone-Locked Responsive View**: Engineered to fit mobile phone screens (`320px–390px`) and desktop monitors (`1440px+`) with zero horizontal scrolling.
- **OpenRouter AI Gateway**: Uses only `OPENROUTER_API_KEY` (`https://openrouter.ai/api/v1/chat/completions`) with automatic deterministic fallback when no key is configured.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Run Verification Tests

```bash
npx tsx --test src/utils/financialEngine.test.ts
npm run build
```

## GitHub & Vercel Deployment

See **[DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)** for complete step-by-step instructions to push to GitHub and deploy on Vercel.
