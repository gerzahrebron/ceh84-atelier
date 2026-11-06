export async function submit(request,db){
 if(request.method!=='POST') return new Response(null,{status:405});
 if(!request.headers.get('content-type')?.startsWith('application/json')) return new Response(null,{status:415});
 const raw=await request.text();
 if(raw.length>18000)return new Response(null,{status:413});
 let body;try{body=JSON.parse(raw)}catch{return new Response(null,{status:400})}
 const limits={name:100,contact:200,project:3000};
 if(!body || typeof body.id!=='string'|| !/^[a-f0-9-]{36}$/i.test(body.id)||Object.entries(limits).some(([k,max])=>typeof body[k]!=='string'||!body[k].trim()||body[k].length>max))return new Response(null,{status:422});
 await db.prepare('INSERT INTO requests(id,name,contact,project) VALUES(?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(body.id,body.name.trim(),body.contact.trim(),body.project.trim()).run();
 return Response.json({saved:true},{status:201});
}
