# Security policy and deployment boundaries

Security controls implemented and tested are not a guarantee of absolute security or an independent penetration test.

- Managed hosted authentication; no app passwords, plaintext credentials or student access tokens in localStorage.
- Per-user authorization in every student record query; server-side tutor allowlist; anonymous access denied for private data.
- Prepared SQL statements, constrained schema fields, length and enum validation, streamed 12 KB request cap.
- Same-origin Origin validation plus required custom request header and JSON content type for every mutation; no permissive CORS.
- Database-backed per-user rate limiting (20 writes/minute) and demo-grade throttling. Add edge abuse controls and a quota strategy before large public traffic.
- No `innerHTML`, `eval`, remote scripts or runtime dependencies; submitted content is rendered as text.
- Restrictive CSP, frame denial, content-type sniffing protection, referrer policy, feature restrictions, HSTS on HTTPS and no-store on all API responses.
- Correct answers kept out of the frontend bundle; ownership checks, completeness validation and atomic one-time grading.
- Explicit data export and confirmed erasure of the current account's active database records.
- Local test files, SQLite databases, secrets and generated output excluded from version control.

## Before opening to real students

Keep the review deployment private until operator identity and a contact channel, actual retention/backup policy, contractual terms, applicable parental arrangements and the intended authentication audience are established. The visible privacy text identifies this as a private preview and does not claim a legal certification. Check current provider age requirements and requirements for your actual users before inviting minors.

Configure tutor email addresses through the hosting environment manager; never commit them as passwords or put privileged keys in JavaScript. A public deployment must remain behind the Sites identity boundary for authenticated requests. Do not forward untrusted client identity headers to a custom backend.

For any new identity integration, file uploads, payments, SMTP or AI features, perform a fresh threat review. File uploads and payment processing are intentionally absent from this release; students type exercise text and no financial details are collected.

## Reporting

Report a suspected issue privately to the repository owner through the agreed business contact. Do not post student data, secrets or exploit payloads in public issues. No public bug-bounty or security-response SLA is asserted.
