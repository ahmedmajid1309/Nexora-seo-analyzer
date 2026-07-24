# Phase 10: Manual Release Checklist

## Pre-Release

- [ ] All quality checks pass: `format`, `lint`, `typecheck`, `test`, `build`
- [ ] E2E tests pass: `pnpm test:e2e`
- [ ] No sensitive data (keys, tokens, secrets) in `.env.example` or committed files
- [ ] `NEXT_PUBLIC_APP_VERSION` updated to release version
- [ ] `NEXT_PUBLIC_SITE_URL` configured for production domain
- [ ] `PAGESPEED_API_KEY` configured in production environment (optional)
- [ ] Risk register reviewed, no CRITICAL or HIGH unmitigated risks

## Security

- [ ] SSRF protections confirmed active (private IPs, metadata endpoints, DNS rebinding)
- [ ] Rate limiting enabled (10 req/min per IP)
- [ ] Host cooldown enabled (30s between audits on same host)
- [ ] Concurrent audit limit enforced (3 max)
- [ ] Privacy-safe logging confirmed (PII redaction active)
- [ ] Health endpoint returns no sensitive data
- [ ] Security headers configured (`vercel.json`): X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- [ ] `noindex` confirmed on `/result` pages

## Configuration

- [ ] `NODE_ENV=production` set in production environment
- [ ] `vercel.json` rewrites and headers reviewed
- [ ] Docker build tested and tagged: `docker build -t nexora-seo-analyzer .`
- [ ] Docker image runs correctly: `docker run -p 3000:3000 nexora-seo-analyzer`
- [ ] Environment variables validated: `node -e "require('./src/config/env')"`

## Monitoring

- [ ] Health endpoint accessible: `GET /api/health` returns 200
- [ ] Monitoring counters operational (health checks, audit requests, errors)
- [ ] Logger output checked for PII leaks in production mode

## Content & Legal

- [ ] Privacy policy reflects actual data handling (no fabricated claims)
- [ ] Terms of service reflect actual service (no false promises)
- [ ] No misleading claims about "ranking prediction", "WCAG compliance", "websites audited"
- [ ] Attribution notices present for ported upstream code
- [ ] License compliance verified

## Vercel Deployment

- [ ] Build passes on Vercel: `vercel build`
- [ ] Deploy to preview: `vercel deploy --preview`
- [ ] Smoke test preview deployment (health endpoint, audit endpoint)
- [ ] Deploy to production: `vercel deploy --prod`
- [ ] Verify production health endpoint returns 200
- [ ] Run smoke test against production URL

## Docker Deployment (self-hosted)

- [ ] Build image: `docker build -t nexora-seo-analyzer:VERSION .`
- [ ] Push to registry: `docker push registry/nexora-seo-analyzer:VERSION`
- [ ] Deploy with required environment variables
- [ ] Verify health endpoint on deployed instance
- [ ] Run smoke test against deployed URL

## Post-Deployment

- [ ] Monitor error rates for first hour
- [ ] Verify logging output (no PII leaks)
- [ ] Check rate limiting counters not elevated beyond expected
- [ ] Confirm cache-control headers on health endpoint
- [ ] Document deployment timestamp and version in release notes
