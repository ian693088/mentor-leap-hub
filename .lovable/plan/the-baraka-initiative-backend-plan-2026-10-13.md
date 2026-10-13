# The Baraka Initiative — Backend Plan

## Current state (inspected)
- Public website only, no backend connected yet.
- Pages: Home, About, Programs, Projects, Get Involved (5 form tabs), Opportunities, News & Impact, Contact.
- Shared header (desktop nav + mobile slide-out), footer, page banner, reusable form.
- All content (programs, projects, opportunities, news) is hardcoded sample data in one file.
- Forms only show a thank-you message; nothing is saved.
- Green / orange / white design system — kept unchanged.

## Stage 1 — Turn on Lovable Cloud + database
Tables (all linked by IDs, each with created/updated timestamps):

| Table | Purpose | Key links |
|---|---|---|
| profiles | Name, phone, avatar for each account | user account |
| user_roles | Roles kept separately (super_admin, coordinator, member, volunteer) | user account |
| programs | The six programs, status draft/published/archived | coordinator |
| program_coordinators | Which coordinator manages which program | program, user |
| projects | Title, summary, progress %, status | program |
| events | Title, date, venue, capacity, status | program |
| event_registrations | Who registered for an event | event, optional user |
| opportunities | Scholarship / training / internship listings, deadline, status | program |
| news_posts | Articles, status, published date | author |
| impact_reports | Period, metrics (learners reached etc.), status | program |
| membership_applications | Applicant details, program interest, review status | optional user, reviewer |
| volunteer_applications | Skills, availability, review status | optional user, reviewer |
| contact_enquiries | Name, email, topic, message, handled flag | — |

Current sample content is loaded in as the starting records so pages look the same.

## Stage 2 — Security rules (enforced in the database)
- Public visitors: read only *published* programs, projects, events, opportunities, news, impact reports; may submit forms (insert only, never read back others').
- Signed-in users: read/update only their own profile and their own applications/registrations.
- Coordinators: manage records for programs they are assigned to; review applications for those programs.
- Super admins: full access, assign roles and coordinators.
- Roles live in a separate table that only super admins can change — users cannot promote themselves. Role checks use a secure database function.
- All form input validated in the browser and with database length/format limits.
- No secret keys in website code. Leaked-password protection turned on.
- First super admin: the first account you register will be promoted by me after you sign up (one-off step).

## Stage 3 — Accounts
- Email + password and Google sign-in; registration, login, logout, forgot-password and reset-password pages.
- "Login / Register" in the header becomes an account menu when signed in.
- "My Account" page: edit profile, see own applications and event registrations.

## Stage 4 — Connect forms and pages
- Membership, volunteer, contact and event-registration forms save to the database with loading, validation, success and error messages. (Partner / Donate / Project-idea tabs go to contact enquiries with a topic.)
- New Events page with registration.
- Programs, Projects, Events, Opportunities, News pages and the Home page load published records.

## Stage 5 — Admin dashboard (/admin)
- Overview counts (members, programs, projects, upcoming events, pending applications).
- Manage sections: Programs, Projects, Events (+ registrations), Opportunities, News, Impact reports — create, edit, publish, archive, delete.
- Review: membership and volunteer applications (approve / reject; approving grants the member or volunteer role), contact enquiries.
- Users & roles (super admin only): assign roles and program coordinators.
- Menu items shown per role; the database still blocks anything not allowed.

## Stage 6 — Testing
- Submit each form, confirm rows saved and still there after refresh.
- Sign up, log in, log out, reset password.
- Try as a normal user: cannot open admin, cannot read others' applications, cannot give themselves a role.
- Run the security scan and fix findings.

## Technical details
- TanStack Start + Lovable Cloud; browser client with row-level security for reads/forms; privileged actions (role assignment, approvals) via authenticated server functions that re-check role with `has_role`.
- Protected pages under `_authenticated/`; admin area additionally gated by role.
- Child welfare data is not collected in this version (safeguarding/consent first).
