import { NextRequest,NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
const schema=z.object({email:z.string().email().max(254),password:z.string().min(1).max(200)});
export async function POST(req:NextRequest){if(Number(req.headers.get('content-length')||0)>3_000)return NextResponse.json({error:'Unable to sign in. Check your details or try again later.'},{status:413});const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';if(!await rateLimit(`login:${ip}`,5,15*60_000))return NextResponse.json({error:'Unable to sign in. Check your details or try again later.'},{status:429});try{const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Unable to sign in. Check your details or try again later.'},{status:400});const user=await prisma.adminUser.findUnique({where:{email:p.data.email.toLowerCase()}});if(!user||!(await bcrypt.compare(p.data.password,user.passwordHash)))return NextResponse.json({error:'Unable to sign in. Check your details or try again later.'},{status:401});await createSession(user.id);return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Sign-in is temporarily unavailable.'},{status:503});}}
