import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { enquirySchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(req:NextRequest){
 const length=Number(req.headers.get('content-length')||0);if(length>20_000)return NextResponse.json({error:'The enquiry is too large. Please shorten your message.'},{status:413});
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'; if(!await rateLimit(`enquiry:${ip}`,5,60_000))return NextResponse.json({error:'Please wait a moment before sending another enquiry.'},{status:429});
 try{const body=await req.json();const parsed=enquirySchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'Please check the form fields and try again.'},{status:400});const data=parsed.data;if(data.website)return NextResponse.json({ok:true});let productName=data.productName||undefined;if(data.productId){const product=await prisma.product.findFirst({where:{id:data.productId,status:'PUBLISHED'},select:{name:true}});productName=product?.name||productName;}
 await prisma.enquiry.create({data:{name:data.name,company:data.company||null,phone:data.phone,email:data.email||null,subject:data.subject,message:data.message,productId:data.productId||null,productName,quantity:data.quantity||null,dimensions:data.dimensions||null,requirements:data.requirements||null}});
 const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASSWORD,SMTP_FROM,ENQUIRY_NOTIFICATION_EMAIL}=process.env;
 if(SMTP_HOST&&SMTP_PORT&&SMTP_USER&&SMTP_PASSWORD&&SMTP_FROM&&ENQUIRY_NOTIFICATION_EMAIL){try{const transporter=nodemailer.createTransport({host:SMTP_HOST,port:Number(SMTP_PORT),secure:Number(SMTP_PORT)===465,auth:{user:SMTP_USER,pass:SMTP_PASSWORD}});await transporter.sendMail({from:SMTP_FROM,to:ENQUIRY_NOTIFICATION_EMAIL,subject:'New website enquiry — Baba Shree Industries',text:`Name: ${data.name}\nCompany: ${data.company||'—'}\nPhone: ${data.phone}\nEmail: ${data.email||'—'}\nProduct: ${productName||'—'}\nQuantity: ${data.quantity||'—'}\nDimensions: ${data.dimensions||'—'}\n\n${data.message}`});}catch{console.error('Enquiry notification email could not be sent.');}}
 return NextResponse.json({ok:true},{status:201});
 }catch{return NextResponse.json({error:'We could not save your enquiry right now. Please call us directly.'},{status:503});}
}
