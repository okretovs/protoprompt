# Deployment: Vercel

The app is hosted on Vercel and connected to GitHub.

## Environments

- Development: local development and local env vars.
- Preview: deployments from pull requests and non-production branches.
- Production: deployments from the production branch, `main`.

## Rules

- Pull requests should produce Vercel preview deployments.
- Production deploys happen from `main`.
- UI or deployment-impacting work should be verified against the Vercel preview URL when possible.
- Automatically add the preview URL back to the related Linear issue when it helps review or QA.
- Do not commit deployment secrets. Document required env vars in `.env.example` without values.

## Verification

Before considering an issue ready for review, run the repo's verification commands. Common defaults for a Vercel app are:

```bash
npm run lint
npm run test --if-present
npm run build
```

The app is not scaffolded yet, so these are aspirational until real scripts exist. Use the commands actually defined by the repo. If a command is missing, do not invent it; report what was available and what was skipped.

## Environment-sensitive work

When a bug appears only after deployment, compare local behaviour with the Vercel preview or production deployment, including:

- environment variables and runtime configuration
- build output
- serverless/edge runtime differences
- route handling and rewrites
- logs available from Vercel or the app
