import {createHash} from 'node:crypto';
export const hashToken=(token:string)=>createHash('sha256').update(`${process.env.SESSION_SECRET??'development-only-change-me'}:${token}`).digest('hex');
