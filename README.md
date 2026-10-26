# Baba Shree Industries — business website & CMS

A responsive Next.js App Router website and private, database-backed admin workspace for Baba Shree Industries. Public catalogue records and CMS settings are read from PostgreSQL; product and enquiry write operations are server-side API routes protected by validation and admin authorization. `public/index.html` is a lightweight compatibility entry that redirects to the app; the live homepage itself is rendered by `src/app/page.tsx`.

## What’s included

- Public home, company profile, products catalogue, product details, industries, contact, privacy and terms pages.
- Database-driven published product listing, catalogue search/filter/sort/pagination, product SEO, and quote/contact submission.
- Admin sign-in with bcrypt password hashes, opaque random session cookies (HTTP-only, Secure in production, SameSite=Lax), database sessions, logout and login throttling.
- Product/category management, drafts/publish/archive, featured-product toggles, duplicate/delete actions, variants/specifications, gallery ordering, page sections, homepage/navigation/contact/footer settings, media library and enquiry inbox/CSV export.
- PostgreSQL schema and initial SQL migration; safe seed script for eight unverified draft products, eight catalogue categories, editable site settings and editable content pages.
- Persistent Supabase Storage uploads (JPEG, PNG and WebP, 8 MB limit; server-side MIME/signature checks), image reference checks before deletion, optional SMTP enquiry notifications, robots/sitemap, LocalBusiness and product structured data, CSP/security headers, unit tests.

## Requirements

- Node.js 20.9+ (Node 22 recommended) and npm.
- PostgreSQL 14+ or a managed PostgreSQL service such as Supabase.
- A Supabase Storage project/bucket for persistent image uploads. Database and image-storage credentials are deliberately not bundled.
- Upstash Redis REST credentials for shared rate limits in production/serverless deployments. Production form/login endpoints fail closed if the shared limiter is not configured.

## Local setup

1. Install packages and configure the environment:

   ```bash
   npm ci
   cp .env.example .env
   ```

2. Set `DATABASE_URL` to the pooled/runtime PostgreSQL URL and `DIRECT_URL` to the direct PostgreSQL connection string. Set `SESSION_SECRET` to a unique random value of at least 32 characters (for example, `openssl rand -base64 48`). Keep `.env` out of source control.

3. Generate the Prisma client, apply the checked-in migration, and seed content:

   ```bash
   npm run db:generate
   npm run db:deploy
   npm run db:seed
   ```

   For iterative schema development against a local database, use `npm run db:migrate` instead of `db:deploy`, then regenerate the client.

4. Create the first administrator from the environment. There is no public registration route:

   ```bash
   ADMIN_EMAIL=owner@example.com \
   ADMIN_PASSWORD='a-long-unique-password-of-14-characters-or-more' \
   npm run admin:create
   ```

   The command hashes the password with bcrypt and refuses to overwrite an existing account. Do not put a production password in source control, build logs or chat.

5. Configure persistent images (for the media library): create a **public** Supabase Storage bucket named `site-media` (or set `SUPABASE_STORAGE_BUCKET`), then set `SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY`. The service-role key is used only by protected server routes and must never use a `NEXT_PUBLIC_` prefix.

6. Run and verify:

   ```bash
   npm run dev
   npm test
   npm run typecheck
   ```

   Open `/admin/login` to sign in. Public pages intentionally hide all seed products because the eight supplied product entries start as **Draft** until their photos/descriptions have been checked and an administrator publishes them.

## Environment variables

See [`.env.example`](.env.example). In addition to the database/session/storage values:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` provide a shared, fixed-window rate limiter across serverless instances. Without these, a small per-process limiter is used only outside production; production login and enquiry requests are refused rather than silently running without distributed limits.
- SMTP notifications are optional. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `ENQUIRY_NOTIFICATION_EMAIL` together. A failed notification does not discard a saved enquiry.
- Set `NEXT_PUBLIC_SITE_URL` to the canonical deployed HTTPS origin for sitemap and metadata generation.

## Seed content and product photography

The seed script creates the eight requested products and categories, but deliberately leaves products in Draft with no product image, dimensions, material, finish, price, capacity or performance claims. Product photos were not present in the checked-out repository, so none were assigned to the wrong product. Upload verified client photography to the media library, add the resulting URLs to the product record, check the copy, then publish. The homepage’s industrial hero photograph is an external Unsplash image and can be replaced in Site settings.

Seed operations use upserts and preserve records already present; page content and site settings are created once so rerunning the seed does not overwrite later CMS edits.

## Admin workspace

- `/admin`: live product and enquiry counts and recent changes.
- `/admin/products`: search/filter, create/edit/duplicate, draft/publish/archive, feature toggle and confirmed deletion.
- `/admin/categories`: add, edit, reorder, hide and delete categories; a category with products cannot be deleted until those products are reassigned.
- `/admin/media`: upload, preview, label/alt text, usage lookup, copy URL and safe deletion after usage checks.
- `/admin/pages`: edit structured plain-text sections, visibility, order, SEO fields and publication state for seeded About, Industries, Contact, Privacy and Terms pages. Arbitrary HTML/JavaScript is not executed.
- `/admin/settings`: company/contact details, header and footer links, logo replacement by upload or Media Library URL, logo width/height sliders and a drag-to-position preview, header CTA/navigation, sticky header, socials, homepage section order/visibility, industries and footer copy. Changes are previewed in the editor and published when saved.
- `/admin/enquiries`: search, status changes, internal notes, call/WhatsApp follow-up and CSV export.

The initial wordmark is an editable text mark. To use a replacement logo, upload it in Media Library and paste its URL into Site settings. For product galleries, paste one persistent image URL per line in the product editor (`URL | alt text`); line order is gallery order. Specification lines use `Label: value`.

## Deployment (Vercel + managed PostgreSQL)

1. Provision PostgreSQL, Supabase Storage, and Upstash Redis. Create the storage bucket and verify public read access for uploaded product photographs.
2. Add all production variables from `.env.example` in the Vercel project settings. Use separate development/production secrets, a pooled runtime database URL, and a direct migration URL. Restrict the database and storage service-role credentials to server-side use.
3. Build with `npm run build` (the build generates Prisma Client and then runs Next.js production compilation). Apply migrations as a deployment step with `npm run db:deploy`, then run `npm run db:seed` once and create the administrator with `npm run admin:create` from a secure operator environment.
4. Set `NEXT_PUBLIC_SITE_URL` to the HTTPS production domain. Test the admin login, catalogue publication, image upload, public enquiry save, CSV export and phone/WhatsApp links before launch.
5. Keep the database and storage in regions appropriate for the business. Review managed-provider retention, access policies, backup schedules and contractual privacy obligations before collecting real customer data.

### Backup, restore and secret rotation

- Take scheduled PostgreSQL backups with your provider or `pg_dump --format=custom "$DIRECT_URL" > bsi-$(date +%F).dump`. Periodically restore into a separate database with `pg_restore --clean --if-exists --dbname "$RESTORE_URL" bsi-YYYY-MM-DD.dump` and verify records/media references.
- Supabase Storage is separate from PostgreSQL; enable bucket/object backup or replication with the storage provider. Database backups alone do not contain image files.
- Rotate `SESSION_SECRET` to invalidate existing sessions, then remove expired/stale rows from `Session`. Rotate the Supabase service-role and SMTP/Redis credentials through their providers and update deployment environment variables; never commit secrets.
- Restrict administrator access to named operators, use unique long passwords, and review administrator access regularly.

## Security and operational notes

- Admin APIs check the server-side session on every protected read/mutation. Passwords use bcrypt; session IDs are random opaque values stored as SHA-256 hashes in PostgreSQL.
- Public quote forms are Zod-validated, bounded, rate-limited, honeypot protected and stored privately. Admin enquiry endpoints are paginated and CSV export is authenticated.
- Uploaded file contents are checked against supported image signatures, not only the filename/MIME header. Active image references block deletion. Supabase service credentials remain server-side.
- A Content Security Policy and standard hardening headers are configured. Cookies use `SameSite=Lax`; forms submit through same-origin JSON endpoints.
- The in-process development rate limiter is not shared across workers. Production deployments require the configured Upstash REST limiter.
- Configure HTTPS, database network access, provider-level WAF/request limits, error monitoring and backups in the hosting account. Do not expose Prisma errors or service secrets to visitors.

## Tests and current verification

`npm test` covers input validation, session-token hashing, upload signature checks, upload-size constants and rate limiting. `npm run typecheck` runs TypeScript validation. A production build was verified. Database integration tests and end-to-end admin/form tests require a configured PostgreSQL database, generated Prisma client, and storage credentials; those services are not included in this repository or sandbox environment. The first deployment must run the setup steps above before CMS writes, admin authentication, or enquiry persistence can be exercised.
