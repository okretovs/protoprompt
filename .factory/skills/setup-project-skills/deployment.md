# Deployment: Vercel

The app is hosted on Vercel and connected to GitHub.

## Rules

- Pull requests should produce Vercel preview deployments.
- Production deploys happen from the configured production branch.
- UI or deployment-impacting work should be verified against the Vercel preview URL when possible.
- Add the preview URL back to the related Linear issue when it helps review or QA.

## Verification

Before considering an issue ready for review, run the repo's verification commands. Common defaults for a Vercel app are:

```bash
npm run lint
npm run test
npm run build
```

Use the commands actually defined by the repo. If a command is missing, do not invent it; report what was available and what was skipped.

## Environment-sensitive work

When a bug appears only after deployment, compare local behaviour with the Vercel preview or production deployment, including:

- environment variables and runtime configuration
- build output
- serverless/edge runtime differences
- route handling and rewrites
- logs available from Vercel or the app
