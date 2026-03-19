let cur=0,ans=new Array(20).fill(null),sc=new Array(10).fill(0),activeDom=null;
const SK='cpd3_';

function save(scr){
try{
localStorage.setItem(SK+'a',JSON.stringify(ans));
localStorage.setItem(SK+'s',JSON.stringify(sc));
localStorage.setItem(SK+'c',cur);
localStorage.setItem(SK+'scr',scr||activeScr());
if(activeDom)localStorage.setItem(SK+'d',activeDom);
}catch(e){}
}

function load(){
try{
const a=localStorage.getItem(SK+'a'),s=localStorage.getItem(SK+'s'),c=localStorage.getItem(SK+'c'),d=localStorage.getItem(SK+'d'),scr=localStorage.getItem(SK+'scr');
if(a)ans=JSON.parse(a);
if(s)sc=JSON.parse(s);
if(c)cur=parseInt(c);
if(d)activeDom=d;
return scr;
}catch(e){return null;}
}

function activeScr(){
for(const id of['welcome','quiz','results','detail'])if(document.getElementById(id).classList.contains('on'))return id;
return'welcome';
}

function show(id){
document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));
document.getElementById(id).classList.add('on');
window.scrollTo(0,0);
}

function goHome(){show('welcome');save('welcome');}
function goResults(){show('results');renderResults();save('results');}
function startQuiz(){show('quiz');renderQ(cur);save('quiz');}

function qNav(dir){
const n=cur+dir;
if(n<0||n>=20)return;
cur=n;
renderQ(cur);
save();
}

function renderQ(qi){
const q=QS[qi];
document.getElementById('qIdx').textContent=qi+1;
document.getElementById('qLabel').textContent='QUESTION '+(qi+1);
document.getElementById('qText').textContent=q.q;
let part=q.part;
if(!part){for(let i=qi;i>=0;i--)if(QS[i].part){part=QS[i].part;break;}}
const pf=document.getElementById('partFlag');
pf.textContent=part||'';
pf.classList.toggle('vis',!!part);
const card=document.getElementById('qCard');
card.classList.remove('vis');
void card.offsetWidth;
card.classList.add('vis');
const done=ans.filter(a=>a!==null).length;
const pct=Math.round(done/20*100);
document.getElementById('progBar').style.width=pct+'%';
document.getElementById('progPct').textContent=pct+'% complete';
document.getElementById('progAns').textContent=done+' / 20 answered';
const el=document.getElementById('optsEl');
el.innerHTML='';
q.opts.forEach((o,oi)=>{
const b=document.createElement('button');
b.className='opt'+(ans[qi]===oi?' picked':'');
b.innerHTML=`<span class="opt-letter">${['A','B','C','D'][oi]}</span><span>${o}</span>`;
b.onclick=()=>pick(qi,oi);
el.appendChild(b);
});
document.getElementById('btnPrev').disabled=(qi===0);
const bn=document.getElementById('btnNext');
bn.disabled=(ans[qi]===null);
const isLast=qi===19;
bn.className='btn-next'+(isLast?' finish':'');
if(isLast){
bn.innerHTML='See Results<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 6.5H9M9 6.5L6 3.5M9 6.5L6 9.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
bn.onclick=()=>{show('results');renderResults();save('results');};
}else{
bn.innerHTML=ans[qi]===null?'Pick an answer first':'Next<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 6.5H9M9 6.5L6 3.5M9 6.5L6 9.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
bn.onclick=()=>qNav(1);
}
document.getElementById('qHint').style.opacity=ans[qi]===null?'1':'0';
}

function pick(qi,oi){
if(ans[qi]!==null)QS[qi].pts[ans[qi]].forEach((p,d)=>sc[d]-=p);
ans[qi]=oi;
QS[qi].pts[oi].forEach((p,d)=>sc[d]+=p);
document.querySelectorAll('.opt').forEach((b,i)=>b.classList.toggle('picked',i===oi));
const bn=document.getElementById('btnNext');
bn.disabled=false;
const isLastQ=(qi===19);
if(!isLastQ)bn.innerHTML='Next<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 6.5H9M9 6.5L6 3.5M9 6.5L6 9.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
document.getElementById('qHint').style.opacity='0';
const done=ans.filter(a=>a!==null).length;
const pct=Math.round(done/20*100);
document.getElementById('progBar').style.width=pct+'%';
document.getElementById('progPct').textContent=pct+'% complete';
document.getElementById('progAns').textContent=done+' / 20 answered';
save();
if(qi<19)setTimeout(()=>qNav(1),300);
}

function nsc(){return sc.map(s=>Math.min(100,Math.round(s/2)));}

function ri(s){
if(s>=70)return{lbl:'Excellent',cls:'be',bar:'linear-gradient(90deg,#1D7A4B,#34D399)'};
if(s>=50)return{lbl:'Good',cls:'bg',bar:'linear-gradient(90deg,#2563AB,#60A5FA)'};
if(s>=30)return{lbl:'Moderate',cls:'bm',bar:'linear-gradient(90deg,#C2622D,#FB923C)'};
return{lbl:'Low',cls:'bl',bar:'#D1D5DB'};
}

function accCls(a){return a==='Accessible'?'acc-access':a==='Moderate'?'acc-moderate':a==='Competitive'?'acc-competitive':'acc-highly';}

function retake(){
ans=new Array(20).fill(null);
sc=new Array(10).fill(0);
cur=0;
['a','s','c','scr','d'].forEach(k=>localStorage.removeItem(SK+k));
show('quiz');
renderQ(0);
}

function renderResults(){
const n=nsc(),ranked=n.map((s,i)=>({s,i})).sort((a,b)=>b.s-a.s);
const medals=['🥇','🥈','🥉'],rk=['Best Fit','Strong Fit','Good Fit'],pc=['p1','p2','p3'];
document.getElementById('podium').innerHTML=[0,1,2].map(r=>{
const d=ranked[r],dm=DOMS[d.i];
return`<div class="pod ${pc[r]}"><div class="pod-medal">${medals[r]}</div><div class="pod-rank">${rk[r]}</div><div class="pod-name">${dm.name}</div><div class="pod-score">${d.s}<small>/100</small></div></div>`;
}).join('');
const grid=document.getElementById('domGrid');
grid.innerHTML='';
ranked.forEach((d,idx)=>{
const dm=DOMS[d.i],info=ri(d.s),rc=(ROLES[dm.key]||[]).length;
const card=document.createElement('div');
card.className='dom-card fade';
card.style.animationDelay=(idx*.04)+'s';
card.innerHTML=`<div class="dc-top"><div class="dc-ico" style="background:${dm.ico_bg}">${dm.icon}</div><div class="dc-info"><div class="dc-name">${dm.name}</div><div class="dc-sub">${rc} roles available</div></div><div class="dc-right"><div class="dc-score">${d.s}</div><div class="dc-badge ${info.cls}">${info.lbl}</div></div></div><div class="dc-bar"><div class="dc-fill" style="background:${info.bar}" data-w="${d.s}"></div></div><div class="dc-cta"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6H10M10 6L7 3M10 6L7 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Explore all ${rc} roles in detail</div>`;
card.addEventListener('click',()=>showDetail(dm.key));
grid.appendChild(card);
});
requestAnimationFrame(()=>setTimeout(()=>{document.querySelectorAll('.dc-fill').forEach(b=>b.style.width=b.dataset.w+'%');},100));
}

function showDetail(key){
activeDom=key;
save('detail');
const dm=DOMS.find(d=>d.key===key);
const idx=DOMS.indexOf(dm),score=nsc()[idx],info=ri(score);
const roles=ROLES[key]||[];
document.getElementById('bcDomain').textContent=dm.name;
document.getElementById('dtHero').innerHTML=`<div class="dt-hero-top"><div class="dt-hero-ico" style="background:${dm.ico_bg}">${dm.icon}</div><h2 class="dt-hero-h">${dm.name}</h2></div><div class="dt-score-row"><div class="dt-score-big">${score}<small>/100</small></div><span class="dc-badge ${info.cls}" style="font-size:11px">${info.lbl} Match</span></div><p class="dt-desc">${dm.desc}</p>`;
document.getElementById('qrefBody').innerHTML=roles.map(r=>`<tr><td style="font-weight:500">${r.title}</td><td>${r.stipend}</td><td>${r.hours}</td><td><span class="acc-badge ${accCls(r.access)}">${r.access}</span></td></tr>`).join('');
const acc=document.getElementById('roleAcc');
acc.innerHTML='';
roles.forEach(role=>{
const item=document.createElement('div');
item.className='role-item';
const accCl=role.access==='Highly Competitive'?'high':'';
item.innerHTML=`<div class="role-head" onclick="toggleRole(this)"><div class="role-title">${role.title}</div><div class="role-tags"><span class="rtag stipend">${role.stipend}</span><span class="rtag hours">${role.hours}</span><span class="rtag acc2 ${accCl}">${role.access}</span></div><svg class="role-chev" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="role-body"><div class="role-inner"><div><div class="rs"><div class="rs-title">Day-to-Day Reality</div><ul class="rs-list">${role.daily.map(d=>`<li>${d}</li>`).join('')}</ul></div><div class="rs"><div class="rs-title">Soft Skills Required</div><ul class="rs-list">${role.soft.map(s=>`<li>${s}</li>`).join('')}</ul></div></div><div><div class="rs"><div class="rs-title">Hard Skills (Priority Order)</div>${role.hard.map((h,i)=>`<div class="sk-row"><span class="sk-num">${i+1}</span><span style="flex:1">${h[0]}</span><span class="sk-level">${h[1]}</span></div>`).join('')}</div><div class="deg-box" style="margin-bottom:10px"><div class="deg-lbl">Primary Degree Alignment</div><p>${role.deg}</p></div><div class="deg-box deg-box-b"><div class="deg-lbl">Other Backgrounds</div><p>${role.deg2}</p></div></div><div class="foru-box"><div class="foru-lbl">Is this role for you?</div><p>${role.foru}</p></div></div></div></div>`;
acc.appendChild(item);
});
show('detail');
}

function toggleRole(head){
const body=head.nextElementSibling,chev=head.querySelector('.role-chev'),open=body.classList.contains('open');
document.querySelectorAll('.role-body.open').forEach(b=>{b.classList.remove('open');b.previousElementSibling.querySelector('.role-chev').classList.remove('open');});
if(!open){body.classList.add('open');chev.classList.add('open');setTimeout(()=>head.scrollIntoView({behavior:'smooth',block:'nearest'}),40);}
}

(function(){
const scr=load();
if(scr==='results'){show('results');renderResults();}
else if(scr==='detail'&&activeDom){show('results');renderResults();showDetail(activeDom);}
else if(scr==='quiz'&&ans.some(a=>a!==null)){show('quiz');renderQ(cur);}
else show('welcome');
})();
