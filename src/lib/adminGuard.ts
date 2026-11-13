import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

/* middleware.ts only matches /admin and /auth pages, so API routes are not
   behind it — a write endpoint has to check the session itself. Returns the JWT
   payload for an authenticated admin, or null. */
export async function getAdminSession() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

/* Both spellings the User schema allows for Super Admin, the same pair the admin
   Sidebar checks; the live account has `superAdmin`. Any other role, including
   the `staff` login writes into the token for an account with no role saved,
   lands on the 403 side. */
const SUPER_ADMIN_ROLES = ['superadmin', 'superAdmin'];

/* For write handlers limited to the Super Admin, not just any signed-in user.
   Returns a 401 with no valid session, a 403 for any other signed-in role, or
   null to go on. Call it before reading the body so a refused request never
   uploads a file. */
export async function denyUnlessSuperAdmin() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!SUPER_ADMIN_ROLES.includes(String(session.role))) {
    return NextResponse.json({ error: 'Only the Super Admin can make this change.' }, { status: 403 });
  }
  return null;
}
