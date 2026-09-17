export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const {UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN}=process.env;
  await fetch(`${UPSTASH_REDIS_REST_URL}`,{method:'POST',headers:{Authorization:`Bearer ${UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify([["LPUSH","journal:entries",JSON.stringify(req.body)]])});
  res.json({ok:true});
}
