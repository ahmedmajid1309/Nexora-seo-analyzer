# API Provider Policy

## Core Principle

Version 1 of the Nexora SEO Analyzer must function fully without any external API provider.

The deterministic audit engine — all static HTML checks, response analysis, and scoring — must never require AI or third-party APIs.

## Provider Overview

| Provider                    | Phase             | Purpose                                             | Dependency Level                                       |
| --------------------------- | ----------------- | --------------------------------------------------- | ------------------------------------------------------ |
| None (deterministic engine) | Phase 1-10        | All static checks, scoring, confidence              | REQUIRED — no alternatives                             |
| PageSpeed Insights          | Phase 7           | Real-world CWV data supplement                      | OPTIONAL — deterministic fallback when PSI unavailable |
| Gemini                      | Phase 13 (future) | Verified-summary generation for executive summaries | OPTIONAL — deterministic summary is default            |
| Groq                        | Phase 13 (future) | Fallback AI provider if Gemini unavailable          | OPTIONAL — deterministic summary is default            |

## PageSpeed Insights

- **Phase**: Phase 7
- **Purpose**: Supplement lab-based CWV measurements with real-user data from CrUX
- **Data used**: LCP, CLS, INP, FCP, TTFB from field data
- **Fallback**: Graceful CWV absence — report shows "no real-user data available" and omits CWV section. Playwright-based lab CWV added in Phase 12.
- **Key management**: Server-side, environment variable, never exposed to client
- **Rate limits**: Respect PSI quota (200 requests per 100 seconds per project)
- **Transparency**: Clearly label PSI data as "real-user data (CrUX)" vs. "lab measurement"

## Gemini

- **Phase**: Phase 13 (future, optional)
- **Purpose**: Generate natural-language executive summary from verified findings
- **Constraints**:
  - May ONLY summarise findings that the deterministic engine produced
  - May NOT invent findings, change scores, or fabricate evidence
  - May NOT predict rankings or guaranteed AI visibility
  - Every AI-generated sentence must trace back to a finding ID
  - Summary must be clearly labeled as "AI-generated summary"
  - Summary must include disclaimer: "Based on verified findings. Scores and evidence are from the deterministic audit engine."
- **Key management**: Server-side, environment-based (`GEMINI_API_KEY`), never `NEXT_PUBLIC_`
- **Model**: Gemini 1.5 Flash or later cost-efficient model
- **Fallback**: Deterministically generated summary from finding templates
- **Reliability**: The product must remain useful when Gemini is unavailable

## Groq

- **Phase**: Phase 13 (future, optional)
- **Purpose**: Fallback AI provider if Gemini unavailable
- **Constraints**: Same as Gemini
- **Key management**: Server-side, environment-based (`GROQ_API_KEY`)
- **Model**: Llama 3 or Mixtral via Groq API

## Prohibited AI Uses

- AI must NEVER invent findings
- AI must NEVER change scores
- AI must NEVER fabricate evidence
- AI must NEVER predict guaranteed rankings
- AI must NEVER claim guaranteed AI visibility
- AI must NEVER introduce recommendations not connected to verified finding IDs
- AI must NEVER access user-supplied URLs directly (only the audit result object)
- AI must NEVER be required for the product to function

## Key Security

- All API keys must be:
  - Server-side only
  - Set via environment variables
  - Absent from version control
  - Absent from client-side bundles
  - Absent from `NEXT_PUBLIC_` prefixed variables
  - Rotated according to provider recommendations
- No API provider is assumed to be permanently free
- Usage must be monitored for cost control
- Rate limiting must apply to API calls as well as user requests
