export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const {message}=req.body;
  const {UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, GEMINI_API_KEY}=process.env;
  let history=[];
  try{
    const h=await fetch(`${UPSTASH_REDIS_REST_URL}`,{method:'POST',headers:{Authorization:`Bearer ${UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify([["LRANGE","journal:entries",0,9]])});
    const j=await h.json(); history=(j[0]?.result||[]).map(s=>{try{return JSON.parse(s)}catch{return {text:s}}}).reverse();
  }catch{}
  const prompt=`You are a private warm journal companion. History:${JSON.stringify(history).slice(0,3000)} Entry:${message}. Reply with insight + reflective question, short.`;
  const gem=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
  const gj=await gem.json();
  const reply=gj.candidates?.[0]?.content?.parts?.[0]?.text || "I heard you. Tell me more.";
  try{await fetch(`${UPSTASH_REDIS_REST_URL}`,{method:'POST',headers:{Authorization:`Bearer ${UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify([["LPUSH","journal:entries",JSON.stringify({text:reply,who:'ai',ts:new Date().toISOString()})]])})}catch{}
  res.json({reply});
}
