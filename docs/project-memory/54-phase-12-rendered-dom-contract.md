# Phase 12 Rendered DOM Contract

Contract version: `1.0.0`.

Quick audit responses may include optional `renderedDom`; site audit responses may include optional aggregate rendered analysis. Existing payloads remain backward-compatible because the field is optional and nullable.

Bounded worker snapshot includes:

- requested URL
- rendered final URL
- title
- description
- canonical
- robots
- H1 values
- heading counts
- rendered text length
- meaningful text length
- internal and external link counts
- image count and alt coverage
- JSON-LD count and bounded structured-data types
- forms summary without values
- HTML language
- viewport
- execution timing
- DOM content hash
- bounded console error summaries
- bounded failed-resource summaries
- rendered-browser lab observations

Public responses exclude:

- full unrestricted DOM
- cookies
- localStorage
- sessionStorage
- form values
- request/response bodies
- authorization headers
- worker secrets

Unavailable metrics remain `null`; missing data is never coerced to zero.
