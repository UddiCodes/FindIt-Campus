TECHNOLOGY STACK AND IMPLEMENTATION REQUIREMENTS — FINDIT CAMPUS

Build FindIt Campus as a production-minded, responsive web application using the following stack:

FRONTEND
- React with Vite
- TypeScript
- Tailwind CSS for styling
- React Router for page navigation
- Lucide React for consistent interface icons
- Motion for subtle, purposeful animations only
- React Hook Form with Zod for form handling and validation, if needed

BACKEND AND DATABASE
- Supabase for backend services
- PostgreSQL for relational data
- Supabase Auth for secure user authentication
- Supabase Storage for item photographs
- Supabase Row Level Security (RLS) for database access control

DATABASE ENTITIES
1. Profiles/Users: id, username, role, created_at
2. Items: id, type, name, category, description, location, date, image_path, reported_by, status, created_at
3. Claims: id, item_id, claimed_by, description, status, created_at

Use UUIDs or appropriate PostgreSQL primary keys and actual foreign-key relationships. Make reported_by and claimed_by reference the authenticated user's profile ID. Define sensible status values and timestamps. Prevent unauthorized users from modifying other users' reports or approving claims. Restrict administrator actions using trusted roles and database policies, never a hardcoded username or frontend-only check.

APPLICATION FEATURES
- Responsive homepage and recent item listings
- Search by item name and description
- Filters for lost/found type, category, location, date, and status
- Item detail pages
- Lost/found reporting forms with image uploads
- Claim submission and claim status tracking
- My Reports page
- Admin dashboard for reviewing reports and claims
- Approve/reject claim workflows and appropriate item status updates
- Loading, empty, success, validation, and error states

DESIGN IMPLEMENTATION
Follow the supplied visual reference: editorial typography, asymmetrical layouts used selectively, warm off-white surfaces, near-black text, restrained lime-green accents, fine borders, carefully chosen imagery, and generous whitespace. Use Space Grotesk for headings and Inter for body/interface text. Avoid neon gradients, glassmorphism, excessive pill-shaped controls, generic SaaS layouts, excessive animations, decorative clutter, and AI-looking stock illustrations. Keep forms, search, and admin workflows practical and accessible.

CODE QUALITY
- Use reusable components and a clear folder structure.
- Keep database operations and UI components organized separately.
- Use environment variables for public configuration.
- Never expose a Supabase service-role key in browser code.
- Provide database migrations or SQL setup scripts and explain required environment variables.
- Include accessible labels, keyboard navigation, responsive behavior, and appropriate error handling.
- Test core workflows, database permissions, and mobile layouts.

DEVELOPMENT PROCESS
First inspect the existing project files and explain the proposed changes. Then implement the project in manageable stages: setup, layout, database schema, authentication, item reporting, search, claims, admin features, testing, and deployment. Do not replace working functionality without reason. Do not build a static mockup: connect the interface to the database and implement the actual workflows. Do not invent completed features or claim tests passed unless they have actually been run.