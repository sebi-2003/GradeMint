# GradeMint architecture

## Browser

`public/index.html`, `styles.css`, and `app.js` are buildless, semantic HTML, responsive CSS, and vanilla JavaScript. No frontend framework, tracking pixel, remote font, remote script, analytics, client-side password storage, or third-party UI runtime is used. The SVG book-and-leaf logo is original. The illustrations deliberately use typography rather than invented tutor portraits or testimonials.

`app.js` constructs dynamic content with `createElement` and text nodes. User-provided content is never interpolated into HTML. Browser storage is not used for student records. The public archive links to SubiecteBAC.ro by year (2015–2026) and subject, plus the Ministry's portal. These are external archives, not locally mirrored PDFs. The public site visibly identifies external sourcing.

## Server

`worker/index.js` is a standard Worker ESM module using Web Request/Response APIs. The build embeds only the allowlisted public files, keeping source modules organized while producing one deployable Worker. SQL schema is versioned in `drizzle/` and provisioned through Sites migrations into the `DB` D1 binding.

Endpoints implement profile updates, private questions, tutor replies, booking requests, tutor booking status, adaptive practice attempts, server-side grading, attempt review, data export and account-data erasure. Every student query is scoped by the authenticated Site user ID. Attempts can be submitted once, using an atomic update condition. Results and explanations are disclosed only after submission, to that attempt's owner.

The question bank contains 30 original practice items, 15 per subject, across three levels. Selection ranks level matches and topics missed in the last ten submitted attempts. Optional topic focus filters the pool. This is transparent, rule-based adaptation, not generative AI; a focused test may contain fewer than six questions. The selected class is a profile field, not a claim of full curriculum coverage. The initial bank needs expanding and tutor review before extensive classroom use.

## Authentication and roles

Hosted authentication uses Sites-managed ChatGPT sign-in. Sites validates browser sessions and supplies trusted `oai-authenticated-user-*` request headers. The application does not implement passwords, an independent OAuth stack or a token database. `/signin-with-chatgpt`, `/signout-with-chatgpt` and `/callback` belong to Sites, not the app.

Tutor access is granted exclusively by exact email matches in the server-side `TUTOR_EMAILS` environment variable. No role from a browser request or profile document is trusted. Empty allowlist fails closed. Email addresses are not published in frontend code or saved in the student profile table. For the first private preview only the requested owner address is configured through the hosting secret manager.

The development server is a loopback-only preview using SQLite and an in-memory opaque session cookie for a synthetic preview student. It strips incoming identity headers and checks the Host header. It is not a production authentication implementation and must never be bound publicly or used as an Internet server.

## Hosting

Sites starts owner-private. This is a private review environment; invited/public student access is a separate deliberate hosting change. Do not change audience implicitly. On GitHub Pages, these server endpoints cannot run: deploy the Worker through Sites, or implement a separately reviewed production backend and identity provider.

The initial repo has no runtime npm dependencies. Node 24+ is required for the local SQLite adapter and native test runner.
