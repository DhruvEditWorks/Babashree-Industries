export function safeJsonLd(value:unknown):string{return JSON.stringify(value).replace(/</g,'\\u003c');}
