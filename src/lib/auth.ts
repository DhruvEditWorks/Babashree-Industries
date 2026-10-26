import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {hashToken} from '@/lib/session-token';
const COOKIE = 'bsi_admin_session';
const SESSION_DAYS = 7;
export async function createSession(userId: string) {
  if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) throw new Error('Admin sessions are not configured.');
  const token = randomBytes(32).toString('base64url');
  await prisma.session.create({ data: { id: hashToken(token), userId, expiresAt: new Date(Date.now() + SESSION_DAYS * 864e5) } });
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: new Date(Date.now() + SESSION_DAYS * 864e5) });
}
export async function getAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const session = await prisma.session.findUnique({ where: { id: hashToken(token) }, include: { user: { select: { id: true, email: true, name: true } } } });
    if (!session || session.expiresAt < new Date()) { if (session) await prisma.session.delete({ where: { id: session.id } }); return null; }
    return session.user;
  } catch { return null; }
}
export async function requireAdmin() { const admin = await getAdmin(); if (!admin) redirect('/admin/login'); return admin; }
export async function clearSession() {
  const jar = await cookies(); const token = jar.get(COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { id: hashToken(token) } });
  jar.delete(COOKIE);
}
