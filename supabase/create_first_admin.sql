/*
 * FitMate — Create First Admin
 * =============================
 *
 * This SQL script promotes an existing FitMate user account to admin role.
 *
 * INSTRUCTIONS:
 * =============
 *
 * 1. Register a normal user account in FitMate (via the Register page).
 * 2. Open your Supabase project dashboard → SQL Editor.
 * 3. Copy and paste this entire file into the SQL Editor.
 * 4. Replace YOUR_ADMIN_EMAIL below with the email you used to register.
 *    Example: WHERE email = 'john.doe@example.com'
 * 5. Click "Run" to execute the SQL.
 * 6. Log out of FitMate (if currently logged in).
 * 7. Log back in using the same email and password.
 *    - You can log in from the regular Login page or the Admin Login page.
 *    - If you log in from the regular Login page, you'll be redirected to /admin automatically.
 * 8. You should now see the Admin Dashboard at /admin.
 *
 * NOTES:
 * - Only run this once. You can run it again to promote additional admin accounts.
 * - Normal users cannot change their own role through the frontend.
 * - The role column is protected by Row Level Security and column-level privileges.
 * - To demote an admin back to user, change 'admin' to 'user' in the SET clause.
 */

UPDATE profiles
SET role = 'admin',
    updated_at = now()
WHERE email = 'YOUR_ADMIN_EMAIL';
