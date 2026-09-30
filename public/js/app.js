const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(url,opt={}){const r=await fetch(url,opt);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Something went wrong');return d;}
const jsonOpt=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
function toast(m,err){const t=$('#toast');t.textContent=m;t.className='toast show'+(err?' bad':'');setTimeout(()=>t.className='toast',3500);}
async function logout(){await api('/api/logout',{method:'POST'});location='/login.html';}
const opts=(a,sel)=>a.map(x=>`<option ${x===sel?'selected':''}>${x}</option>`).join('');
const CATS=['Overflowing Bin','Garbage on Road','Missed Collection','Illegal Dumping','Improper Waste Segregation','Other'];
const CST=['Pending','In Progress','Resolved','Rejected'];
const WT=['Wet Waste','Dry Waste','Plastic','E-Waste','Mixed Waste','Other'];
const PST=['Pending','Scheduled','Picked Up','Cancelled'];
const mapLink=l=>`<a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l)}">📍 ${esc(l)}</a>`;
const badge=s=>`<span class="badge b-${s.replace(/\s/g,'')}">${esc(s)}</span>`;
function timeline(s){
  if(s==='Rejected')return '<div class="tl"><span class="on">Submitted</span><span class="rej">Rejected</span></div>';
  const i={Pending:0,'In Progress':2,Resolved:3}[s];
  return '<div class="tl">'+['Submitted','Reviewed','In Progress','Resolved'].map((x,k)=>`<span class="${k<=i?'on':''}">${x}</span>`).join('')+'</div>';
}
