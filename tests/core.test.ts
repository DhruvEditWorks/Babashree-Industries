import {describe,it,expect} from 'vitest';
import {enquirySchema,productSchema} from '../src/lib/validation';
import {detectImageMime,MAX_MEDIA_BYTES} from '../src/lib/media-validation';
import {rateLimit} from '../src/lib/rate-limit';
import {hashToken} from '../src/lib/session-token';

describe('public enquiry validation',()=>{
 it('accepts a valid business enquiry and trims customer data',()=>{const result=enquirySchema.safeParse({name:'  Priya Rao ',company:'Fab Co',phone:'+91 9617999539',email:'',subject:'Quote request',message:'Please share product details.',productName:'Solar L Hook'});expect(result.success).toBe(true);if(result.success)expect(result.data.name).toBe('Priya Rao');});
 it('rejects malformed phone numbers and short messages',()=>{expect(enquirySchema.safeParse({name:'A',phone:'call me',message:'Hi'}).success).toBe(false);});
 it('accepts a configured product code only through a valid shape',()=>{expect(productSchema.safeParse({name:'Solar L Hook',slug:'solar-l-hook',sku:'SLH-01',status:'DRAFT',customSizes:true}).success).toBe(true);expect(productSchema.safeParse({name:'Bad',slug:'bad product',status:'LIVE'}).success).toBe(false);});
});
describe('media upload signature validation',()=>{
 it('recognizes JPEG, PNG and WebP file signatures',()=>{expect(detectImageMime(Buffer.from([0xff,0xd8,0xff,0xdb]))).toBe('image/jpeg');expect(detectImageMime(Buffer.from([137,80,78,71,13,10,26,10]))).toBe('image/png');expect(detectImageMime(Buffer.from('RIFFxxxxWEBP'))).toBe('image/webp');});
 it('rejects files without an approved signature and defines a bounded size',()=>{expect(detectImageMime(Buffer.from('not an image'))).toBeNull();expect(MAX_MEDIA_BYTES).toBe(8*1024*1024);});
});
describe('security helpers',()=>{
 it('hashes session tokens deterministically without returning raw token',()=>{expect(hashToken('secret')).toBe(hashToken('secret'));expect(hashToken('secret')).not.toBe('secret');});
 it('blocks requests over the configured in-process rate limit',async()=>{const key=`test:${Date.now()}:${Math.random()}`;for(let i=0;i<2;i++)expect(await rateLimit(key,2,60_000)).toBe(true);expect(await rateLimit(key,2,60_000)).toBe(false);});
});
