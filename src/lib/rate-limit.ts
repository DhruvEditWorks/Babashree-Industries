import {createHash} from 'node:crypto';
const hits = new Map<string,{count:number;reset:number}>();
/** Uses Upstash Redis when configured for cross-instance limiting; otherwise a per-process guard is used for development. */
export async function rateLimit(key:string,limit=6,windowMs=60_000){
 const url=process.env.UPSTASH_REDIS_REST_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if(process.env.NODE_ENV==='production'&&(!url||!token))return false;
 if(url&&token){try{const safe=createHash('sha256').update(key).digest('hex'),base=url.replace(/\/$/,'');const response=await fetch(`${base}/incr/bsi:ratelimit:${safe}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});if(!response.ok)return false;const payload=await response.json() as {result:number};if(payload.result===1)await fetch(`${base}/expire/bsi:ratelimit:${safe}/${Math.ceil(windowMs/1000)}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});return payload.result<=limit;}catch{return false;}}
 const now=Date.now(),current=hits.get(key);if(!current||current.reset<now){hits.set(key,{count:1,reset:now+windowMs});return true;}if(current.count>=limit)return false;current.count++;return true;
}
