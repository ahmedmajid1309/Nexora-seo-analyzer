# Product Architecture

## First-Release Architecture (Simplified)

The first working release runs fully inside a single Next.js application without external infrastructure:

- **Audit execution**: Runs synchronously within the API route (within request timeout limits). No separate worker containers, no job queues.
- **Storage**: Audit results returned directly in the API response. Basic optional persistence via simple file-based storage or in-memory cache. PostgreSQL, S3/R2, and Redis are not required.
- **Rendered DOM**: Not included in first release. All audits use static HTML analysis only. CWV data uses PageSpeed Insights API with graceful fallback when unavailable.
- **Rate limiting**: Simple in-memory rate limiting (per-IP counters). Redis not required.
- **Playwright**: Not included. No headless browser worker.

This simplified architecture supports the entire first-release feature set. The advanced distributed infrastructure described below (PostgreSQL, S3/R2, Redis, job queues, multiple workers, Playwright container) is reserved for later phases and is explicitly **not mandatory** for the first working release.

## Target Architecture (Future Phases)

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                  │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Landing   │  │ Audit    │  │ Report Viewer    │  │
│  │ Page      │  │ Launcher │  │ (Scores, Issues, │  │
│  │           │  │          │  │  Evidence, CTA)  │  │
│  └───────────┘  └──────────┘  └──────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│              API Gateway (Next.js API Routes)         │
│  ┌────────────────────────────────────────────────┐  │
│  │  URL Validation & Sanitization                 │  │
│  │  Rate Limiting                                 │  │
│  │  Job Dispatch (SQS / BullMQ)                   │  │
│  │  Result Retrieval                              │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│  Static Audit    │    │  Rendered DOM Worker  │
│  Worker          │    │  (Playwright)         │
│  (Isolated       │    │  (Isolated Container) │
│   Container)     │    │                       │
│                  │    │  - CWV measurement    │
│  - SSRF-hardened │    │  - JS-rendered DOM    │
│    fetcher       │    │  - Screenshot         │
│  - Cheerio parse │    └──────────────────────┘
│  - All static    │
│    rules         │
│  - JSON result   │
└──────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Storage                            │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ PostgreSQL │  │ S3 / R2    │  │ Redis         │  │
│  │ (Results,  │  │ (Raw HTML  │  │ (Job Queue,   │  │
│  │  Users,    │  │  snapshots)│  │  Rate Limits) │  │
│  │  Projects) │  │            │  │               │  │
│  └────────────┘  └────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Frontend

- **Framework**: Next.js (App Router)
- **Deployment**: Vercel (frontend only)
- **Purpose**: Landing page, audit launcher, report viewer, legal pages, blog
- **Key responsibilities**: URL input, real-time progress display, score reveal, interactive report, shareable report URLs, lead-generation CTAs

## API Gateway

- **Implementation**: Next.js API Routes
- **Purpose**: Accept audit requests, validate URLs, enforce rate limits, dispatch jobs, return results
- **Key responsibilities**: Input sanitisation, rate limiting (IP-based, token-based), job queuing, result caching

## Static Audit Worker

- **Runtime**: Isolated container (ECS Fargate / Google Cloud Run)
- **Purpose**: Fetch a single URL, extract all static data, run all static rules, produce scored result
- **Key components**:
  - SSRF-hardened HTTP client
  - Cheerio-based HTML parser
  - Rule execution engine
  - Scoring engine
  - Result serializer

## Rendered DOM Worker (Future Phase)

- **Runtime**: Isolated container with Playwright
- **Purpose**: Fetch URL with headless browser, measure CWV, capture rendered DOM for JS rendering analysis
- **Key constraints**: Separate queue from static worker, longer timeout, higher memory allocation, browser binary caching

## Storage

- **PostgreSQL**: Audit results, user data, project configurations, sitemap indexes
- **S3/R2**: Raw HTML snapshots, screenshots (if added), large report artifacts
- **Redis**: Job queues, rate-limit counters, cache keys

## Data Flow (Quick Page Audit)

1. User enters URL on landing page
2. Frontend sends URL to API Gateway
3. Gateway validates and sanitises URL
4. Gateway pushes job to static audit queue
5. Static worker fetches URL via SSRF-hardened client
6. Worker parses HTML with Cheerio
7. Worker runs all applicable static rules
8. Worker calculates scores and confidence
9. Worker writes result to PostgreSQL + cache
10. Frontend polls for result and displays report

## Data Flow (Limited Website Audit)

1-4. Same as Quick Page Audit 5. Worker fetches URL and discovers links up to configured max pages (25) 6. Worker creates crawl queue and fetches each page (with concurrency limit) 7. Worker runs single-page rules on each page 8. Worker runs cross-page rules across all pages (duplicates, orphans, etc.) 9. Worker calculates aggregate scores 10. Worker writes result set 11. Frontend displays multi-page report with issue grouping

## Architecture Decisions

| Decision                               | Rationale                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Next.js frontend only (not full-stack) | Avoid serverless limitations for heavy audit work. Workers run in appropriately sized containers.      |
| Separate worker containers             | SSRF hardening, Playwright isolation, and memory requirements are incompatible with Vercel serverless. |
| PostgreSQL over SQLite                 | Cloud-native, concurrent access, no native addon compilation issues.                                   |
| S3/R2 for raw storage                  | HTML snapshots enable evidence replay and debugging without re-fetching.                               |
| Redis-backed job queue                 | Reliable async processing with retry, dead-letter, and visibility timeouts.                            |
