# DSA Progress Tracker

A public student DSA problem tracker with a protected, password-only admin problem manager.

## How it works

- **Users do not create accounts and do not log in.** They open the tracker and use the published problem sheet.
- **Only the admin logs in.** The admin login asks for a password only; the email is kept in `VITE_ADMIN_EMAIL` and is never shown in the login form.
- Admin can insert problems, choose topic/concept, difficulty and importance, publish/hide, and delete problems.
- The admin does **not** enter a LeetCode URL. The app generates `https://leetcode.com/problems/<slug>/` from the exact problem title.
- User progress is stored in the browser with localStorage. No student account is required.

## Supabase setup

1. Create/open your Supabase project.
2. Run the complete `supabase/schema.sql` in the Supabase SQL Editor.
3. Create the admin account in **Authentication → Users**.
4. If you want no email verification, disable **Confirm email** in Supabase Authentication settings before creating new admin accounts. Existing admin accounts must be confirmed if your project currently requires confirmation.
5. Set that account's profile role to `admin` using SQL:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
```

6. Create `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
VITE_ADMIN_EMAIL=YOUR_ADMIN_EMAIL
```

`VITE_ADMIN_EMAIL` is only the internal Supabase Auth identifier used by the password-only admin form. It is not a password or secret.

7. Install and run:

```bash
npm install
npm run dev
```

## Security

- The frontend never contains an admin password.
- Admin insert/update/delete operations are protected by Supabase Row Level Security and the `profiles.role = 'admin'` check.
- Public users can read only published problems.
- Do **not** put a Supabase service-role/secret key in the Vite frontend.

## LeetCode URL generation

The admin enters the exact LeetCode problem title. The app converts it to a standard LeetCode slug. Example:

`Two Sum` → `https://leetcode.com/problems/two-sum/`

For unusual titles where LeetCode uses a non-standard slug, the generated link may need a future override field. The current admin form intentionally has no URL input, as requested.
