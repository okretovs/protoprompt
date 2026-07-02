# Deployment: Vercel

Vercel is the deployment platform for Preview and Production deployments.

## Environments

- Development: local development and local env vars.
- Preview: deployments from PRs and non-production branches.
- Production: deployments from the production branch, normally `main`.

## Rules

- Use Vercel Preview deployments to verify PRs.
- Include preview links in PRs and Linear issues for UI/deployment-impacting work.
- Do not commit deployment secrets.
- Document required env vars in `.env.example` without values.
- If a bug appears only on Vercel, compare local env vars, build output, route/runtime differences, and deployment logs.

## Verification

Before merging deployment-impacting changes, confirm:

```txt
[ ] Local build passes
[ ] Vercel Preview deployment succeeds
[ ] Affected route/page works on the Preview URL
[ ] Required env vars exist in the target Vercel environment
```
