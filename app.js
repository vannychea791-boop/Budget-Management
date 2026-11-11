'use strict';
const D=DATA,M=D.months,$=(s,r=document)=>r.querySelector(s);
const sum=a=>a.reduce((x,y)=>x+y,0),Z=()=>Array(12).fill(0);
const nf=new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmt=n=>nf.format(n||0),pc=n=>(n*100).toFixed(1)+'%';
const kf=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'k':String(Math.round(n));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mIdx=d=>(+d.slice(0,4)-2026)*12+(+d.slice(5,7)-10);
const IC={dash:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
tx:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',plan:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
var:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'};
const ico=n=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const NAV=[['dash','Dashboard'],['tx','Transactions'],['plan','Plan'],['var','Variance'],['set','Settings']];
const TITLE={dash:'Dashboard',tx:'Transactions',plan:'Monthly plan',var:'Variance report',set:'Settings'};

/* ---------- state ---------- */
const KEY='bms-fy27-v2';
const mk=(s,i)=>({id:'s'+i,d:s[0],a:s[1],t:s[2],m:s[3],x:s[4],r:s[5]});
const nowIdx=()=>{const n=new Date(),i=(n.getFullYear()-2026)*12+n.getMonth()-9;return i>=0&&i<12?i:0};
let S={tab:'dash',mi:nowIdx(),view:'A',q:'',flt:'all',tf:'all',cfg:{watch:80,over:100,theme:'auto'},tx:D.S.map(mk),sample:true};
try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&Array.isArray(r.tx))Object.assign(S,{tx:r.tx,cfg:Object.assign(S.cfg,r.cfg),sample:!!r.sample,mi:r.mi??S.mi})}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({tx:S.tx,cfg:S.cfg,sample:S.sample,mi:S.mi}))}catch(e){}};

/* ---------- calculations ---------- */
function rows(v){
  const src=v=='A'?D.A:D.T,ac={};
  S.tx.forEach(t=>{const i=mIdx(t.d);if(i<0||i>11)return;
    const k=v=='A'?(D.A.some(r=>r[0]==t.a)?t.a:'NOACT'):(D.T.some(r=>r[0]==t.t)?t.t:'OTHER');
    (ac[k]=ac[k]||Z())[i]+=+t.m||0});
  const tp=D.T.reduce((a,r)=>a.map((x,i)=>x+r[2][i]),Z());
  const out=src.map(r=>({c:r[0],n:r[1],p:r[2],a:ac[r[0]]||Z()}));
  const sp=out.reduce((a,r)=>a.map((x,i)=>x+r.p[i]),Z()),sa=out.reduce((a,r)=>a.map((x,i)=>x+r.a[i]),Z());
  const ta=Object.values(ac).reduce((a,r)=>a.map((x,i)=>x+r[i]),Z());
  out.push({c:v=='A'?'NOACT':'OTHER',n:v=='A'?'No activity (support & allocation costs)':'Other accounts',p:tp.map((x,i)=>x-sp[i]),a:ta.map((x,i)=>x-sa[i]),o:1});
  return out}
const tot=R=>({c:'',n:'Total',p:Z().map((_,i)=>sum(R.map(r=>r.p[i]))),a:Z().map((_,i)=>sum(R.map(r=>r.a[i]))),t:1});
const st=(p,a)=>!p&&!a?'none':!p?'unplanned':!a?'unspent':a/p>S.cfg.over/100?'over':a/p>S.cfg.watch/100?'warn':'ok';
const LB={ok:'Within budget',warn:'Watch',over:'Over budget',unspent:'Unspent',unplanned:'Unplanned'};
const pill=k=>k=='none'?'<span class="mu">–</span>':`<span class="pill ${k}">${LB[k]}</span>`;
const vc=n=>`<td class="${n<-.005?'neg':''}">${fmt(n)}</td>`;
const pb=(p,a)=>`<div class="pb"><i class="${st(p,a)}" style="width:${Math.min(100,p?a/p*100:a?100:0)}%"></i></div>`;
const match=(r,q)=>!q||(r.c+' '+r.n).toLowerCase().includes(q.toLowerCase());
const short=s=>s.length>64?s.slice(0,62)+'…':s;

/* ---------- dashboard ---------- */
function colChart(tp,ta){
  const w=680,h=250,l=44,b=28,t=10,mx=Math.max(1,...tp,...ta),gw=(w-l)/12,bw=gw*.3;let s=`<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Planned versus actual by month">`;
  for(let g=0;g<=4;g++){const y=h-b-(h-b-t)*g/4;s+=`<line x1="${l}" x2="${w}" y1="${y}" y2="${y}" stroke="var(--bd)"/><text x="${l-6}" y="${y+4}" text-anchor="end">${kf(mx*g/4)}</text>`}
  M.forEach((m,i)=>{const x=l+gw*i,cx=x+gw/2,hp=(h-b-t)*tp[i]/mx,ha=(h-b-t)*ta[i]/mx;
    s+=`${i==S.mi?`<rect class="sel" x="${x+2}" y="${t}" width="${gw-4}" height="${h-b-t}" rx="6"/>`:''}<rect x="${cx-bw-1}" y="${h-b-hp}" width="${bw}" height="${hp}" rx="2" fill="var(--pl)"/><rect x="${cx+1}" y="${h-b-ha}" width="${bw}" height="${ha}" rx="2" fill="var(--ac)"/><text x="${cx}" y="${h-9}" text-anchor="middle">${m.slice(0,3)}</text><rect data-m="${i}" x="${x}" y="${t}" width="${gw}" height="${h-t}" fill="transparent"><title>${m}: planned ${fmt(tp[i])}, actual ${fmt(ta[i])}</title></rect>`});
  return s+'</svg><div class="lg"><span><i style="background:var(--pl)"></i>Planned</span><span><i style="background:var(--ac)"></i>Actual</span><span>Tap a month to select it</span></div>'}
function vDash(){
  const R=rows('A'),T=tot(R),i=S.mi,P=T.p[i],A=T.a[i],yp=sum(T.p.slice(0,i+1)),ya=sum(T.a.slice(0,i+1)),an=sum(T.p);
  const banner=S.sample?`<div class="banner">${''}<span><b>Sample data is loaded</b> so you can see how it works. Clear it before entering real spending.</span><button class="btn s" data-a="clr">Clear sample data</button></div>`:'';
  const kpi=(l,v,sub,bar,c='')=>`<div class="card kpi ${c}"><div class="kl">${l}</div><div class="kv">${v}</div><div class="ks">${sub}</div>${bar||''}</div>`;
  const groups=[...new Set(D.A.map(r=>r[0].slice(0,5)))].map(g=>{const rr=R.filter(r=>r.c.startsWith(g+'.'));return{g,n:rr.filter(r=>sum(r.p)).length,p:sum(rr.map(r=>r.p[i])),a:sum(rr.map(r=>r.a[i]))}});
  const o=R[R.length-1];groups.push({g:'Support',n:0,p:o.p[i],a:o.a[i]});
  const gl=groups.filter(g=>g.p||g.a).map(g=>`<div class="gr"><div class="gt"><b>${g.g=='Support'?'Support & allocation':'Activity '+g.g}</b><span>${fmt(g.a)} of ${fmt(g.p)}</span></div>${pb(g.p,g.a)}</div>`).join('')||'<div class="empty">No budget this month.</div>';
  const att=R.filter(r=>!r.o).map(r=>{const p=sum(r.p.slice(0,i+1)),a=sum(r.a.slice(0,i+1));return{r,p,a,k:st(p,a)}})
    .filter(x=>['over','unplanned','warn','unspent'].includes(x.k)).sort((x,y)=>({over:0,unplanned:1,warn:2,unspent:3}[x.k]-{over:0,unplanned:1,warn:2,unspent:3}[y.k])||(y.a-y.p)-(x.a-x.p)||y.p-x.p).slice(0,6);
  const al=att.map(x=>`<div class="li"><div><b>${esc(x.r.c)}</b> ${esc(short(x.r.n))}<small>YTD plan ${fmt(x.p)} · actual ${fmt(x.a)}</small></div>${pill(x.k)}</div>`).join('')||'<div class="empty">Nothing needs attention.</div>';
  const rec=[...S.tx].sort((a,b)=>a.d<b.d?1:-1).slice(0,5).map(t=>`<div class="li"><div>${esc(t.x||'(no description)')}<small>${t.d} · ${esc(t.a||'Support cost')}</small></div><b>${fmt(t.m)}</b></div>`).join('')||'<div class="empty">No transactions yet. Tap “Add expense”.</div>';
  return `${banner}<div class="grid g4">
${kpi('Planned · '+M[i],fmt(P),`YTD ${fmt(yp)}`)}
${kpi('Actual · '+M[i],fmt(A),`${pill(st(P,A))}${P?pc(A/P)+' of plan':''}`,pb(P,A))}
${kpi('Variance (plan − actual)',`<span class="${P-A<-.005?'neg':''}">${fmt(P-A)}</span>`,P-A<-.005?'Overspent this month':'Within plan this month')}
${kpi('Annual budget used',pc(an?ya/an:0),`${fmt(ya)} of ${fmt(an)}`,pb(an,ya))}</div>
<div class="grid g4" style="margin-top:14px">${kpi('YTD planned',fmt(yp),'Oct to '+M[i].slice(0,3),'','sm')}${kpi('YTD actual',fmt(ya),yp?pc(ya/yp)+' of YTD plan':'','','sm')}${kpi('YTD variance',`<span class="${yp-ya<-.005?'neg':''}">${fmt(yp-ya)}</span>`,'Plan − actual','','sm')}${kpi('Remaining (annual)',fmt(an-ya),'Annual plan − YTD actual','','sm')}</div>
<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Planned vs actual by month</h2>${colChart(T.p,T.a)}</div>
<div class="card"><h2>${M[i]} · budget used by activity group</h2>${gl}</div>
<div class="card"><h2>Needs attention <span class="mu" style="font-weight:400">year to date</span></h2>${al}</div>
<div class="card"><h2>Recent transactions <button class="btn s" data-a="go" data-v="tx">View all</button></h2>${rec}</div></div>`}

/* ---------- transactions ---------- */
function txRows(){const q=S.q.toLowerCase();return S.tx.filter(t=>(S.tf=='all'||mIdx(t.d)==+S.tf)&&(!q||[t.x,t.a,t.t,t.r,fmt(t.m)].join(' ').toLowerCase().includes(q))).sort((a,b)=>a.d<b.d?1:-1)}
function tblTx(){const L=txRows();if(!L.length)return `<div class="empty">No transactions match. Use “Add expense” to record one.</div>`;
  return `<div class="tw"><table><thead><tr><th class="l">Date</th><th class="l">Activity</th><th class="l hm">T2 account</th><th class="l">Description</th><th class="hm">Voucher</th><th>Amount</th><th></th></tr></thead><tbody>${L.map(t=>`<tr><td class="l" style="white-space:nowrap">${t.d}</td><td class="l">${t.a?`<b class="code" style="color:var(--pri)">${esc(t.a)}</b>`:'<span class="mu">Support cost</span>'}</td><td class="l hm">${esc(t.t)}</td><td class="l">${esc(t.x)}</td><td class="hm">${esc(t.r)}</td><td><b>${fmt(t.m)}</b></td><td style="white-space:nowrap"><button class="btn s" data-a="edit" data-v="${t.id}">Edit</button> <button class="btn s d" data-a="del" data-v="${t.id}">Delete</button></td></tr>`).join('')}</tbody><tfoot><tr class="tot"><td class="l" colspan="5">${L.length} transaction${L.length>1?'s':''}</td><td>${fmt(sum(L.map(t=>+t.m)))}</td><td></td></tr></tfoot></table></div>`}
function vTx(){return `${S.sample?`<div class="banner"><span>Showing <b>sample data</b>.</span><button class="btn s" data-a="clr">Clear sample data</button></div>`:''}
<div class="tb"><input class="in" type="search" data-i="q" placeholder="Search description, activity, voucher…" value="${esc(S.q)}" aria-label="Search" style="min-width:240px;flex:1;max-width:380px">
<select class="in" data-c="tf" aria-label="Filter month"><option value="all">All months</option>${M.map((m,i)=>`<option value="${i}" ${S.tf==i?'selected':''}>${m}</option>`).join('')}</select><span class="sp"></span>
<button class="btn" data-a="csv">Export CSV</button></div><div id="tbl">${tblTx()}</div>`}

/* ---------- plan ---------- */
const segV=()=>`<div class="seg" role="group" aria-label="View by"><button data-a="view" data-v="A" aria-pressed="${S.view=='A'}">By activity</button><button data-a="view" data-v="T" aria-pressed="${S.view=='T'}">By expense account</button></div>`;
const first=r=>`<td class="l st" title="${esc(r.n)}"><b class="code">${esc(r.c)}</b>${esc(r.n)}</td>`;
function tblPlan(){const R=rows(S.view).filter(r=>(sum(r.p)||(!r.o&&0))&&match(r,S.q)),T=tot(R);
  if(!R.length)return '<div class="empty">No items match.</div>';
  const line=r=>`<tr class="${r.t?'tot':''}">${r.t?`<td class="l st">Total (shown)</td>`:first(r)}${r.p.map(v=>`<td>${fmt(v)}</td>`).join('')}<td><b>${fmt(sum(r.p))}</b></td>${[0,1,2,3].map(q=>`<td>${fmt(sum(r.p.slice(q*3,q*3+3)))}</td>`).join('')}</tr>`;
  return `<div class="tw"><table><thead><tr><th class="l st">Item</th>${M.map(m=>`<th>${m}</th>`).join('')}<th>Total</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody>${R.map(line).join('')}${line(T)}</tbody></table></div>`}
function vPlan(){return `<div class="tb">${segV()}<input class="in" type="search" data-i="q" placeholder="Search code or name…" value="${esc(S.q)}" aria-label="Search" style="min-width:220px;flex:1;max-width:340px"></div><div id="tbl">${tblPlan()}</div><p class="mu">Planned Amount by month from the iMPAQ budget template. Quarters follow the fiscal year (Q1 = Oct–Dec).</p>`}

/* ---------- variance ---------- */
function tblVar(){const i=S.mi,m=i+1;let R=rows(S.view).filter(r=>sum(r.p)||sum(r.a));
  const tl=tot(R),dec=r=>{const P=r.p[i],A=r.a[i],yp=sum(r.p.slice(0,m)),ya=sum(r.a.slice(0,m)),an=sum(r.p),rem=an-ya;return{r,P,A,yp,ya,an,rem,km:st(P,A),ky:st(yp,ya)}};
  const D2=R.filter(r=>match(r,S.q)).map(dec).filter(x=>S.flt=='all'||x.ky==S.flt);
  if(!D2.length)return '<div class="empty">No items match.</div>';
  const line=(x,t)=>`<tr class="${t?'tot':''}">${t?'<td class="l st">Total (all items)</td>':first(x.r)}<td>${fmt(x.an)}</td><td>${fmt(x.P)}</td><td>${fmt(x.A)}</td>${vc(x.P-x.A)}<td class="c">${pill(x.km)}</td><td>${fmt(x.yp)}</td><td>${fmt(x.ya)}</td>${vc(x.yp-x.ya)}<td class="c">${pill(x.ky)}</td><td>${x.an?pc(x.ya/x.an):'–'}</td><td>${fmt(x.ya/m)}</td><td>${fmt(x.rem)}</td><td>${m<12?fmt(x.rem/(12-m)):'–'}</td></tr>`;
  return `<div class="tw"><table><thead><tr><th class="l st" rowspan="2">Item</th><th rowspan="2">Annual plan</th><th colspan="5" class="c">${M[i]}</th><th colspan="5" class="c">Year to date</th><th rowspan="2">Annual % used</th><th rowspan="2">Burn rate / month</th><th rowspan="2">Remaining</th><th rowspan="2">Available / month left</th></tr><tr><th style="top:34px">Planned</th><th style="top:34px">Actual</th><th style="top:34px">Variance</th><th style="top:34px">Status</th><th style="top:34px">Planned</th><th style="top:34px">Actual</th><th style="top:34px">Variance</th><th style="top:34px">Status</th></tr></thead><tbody>${D2.map(x=>line(x)).join('')}${line(dec(tl),1)}</tbody></table></div>`}
function vVar(){const f=[['all','All'],['over','Over budget'],['warn','Watch'],['unspent','Unspent'],['unplanned','Unplanned']];
  return `<div class="tb">${segV()}<div class="seg" role="group" aria-label="Filter by YTD status">${f.map(([k,l])=>`<button data-a="flt" data-v="${k}" aria-pressed="${S.flt==k}">${l}</button>`).join('')}</div>
<input class="in" type="search" data-i="q" placeholder="Search…" value="${esc(S.q)}" aria-label="Search" style="min-width:180px;flex:1;max-width:300px"></div><div id="tbl">${tblVar()}</div>
<p class="mu">Variance = planned − actual; red means overspent. Status: Watch above ${S.cfg.watch}% used, Over budget above ${S.cfg.over}%, Unspent = planned but nothing spent, Unplanned = spending with no plan. Burn rate = average actual spend per month to date.</p>`}

/* ---------- settings ---------- */
let ip=null;
function vSet(){const row=(t,s,c)=>`<div class="row"><div>${t}<small>${s}</small></div><div>${c}</div></div>`;
  return `<div class="grid g2"><div class="card"><h2>Alert thresholds</h2>
${row('Watch (yellow) above','Percent of plan used',`<input class="in" type="number" min="1" max="200" style="width:84px" value="${S.cfg.watch}" data-c="watch"> %`)}
${row('Over budget (red) above','Percent of plan used',`<input class="in" type="number" min="1" max="300" style="width:84px" value="${S.cfg.over}" data-c="over"> %`)}
${row('Appearance','Follow the device or choose',`<select class="in" data-c="theme">${['auto','light','dark'].map(v=>`<option value="${v}" ${S.cfg.theme==v?'selected':''}>${{auto:'Automatic',light:'Light',dark:'Dark'}[v]}</option>`).join('')}</select>`)}</div>
<div class="card"><h2>Your data</h2>
${row('Back up','Download all transactions as a file',`<button class="btn" data-a="backup">Download backup</button>`)}
${row('Restore','Load a backup file (replaces current data)',`<button class="btn" data-a="restore">Choose file…</button>`)}
${row('Export CSV','For Excel or reporting',`<button class="btn" data-a="csv">Export</button>`)}
${row('Sample data','Remove the example transactions',`<button class="btn" data-a="clr" ${S.sample?'':'disabled'}>Clear samples</button>`)}
${row('Reset everything','Delete all transactions and settings',`<button class="btn d" data-a="rst">Reset</button>`)}</div>
<div class="card"><h2>Install this app</h2>${ip?`<p>Install for quick access and offline use.</p><button class="btn p" data-a="install">Install app</button>`:`<p class="mu">Android (Chrome): menu → Install app.<br>iPhone (Safari): Share → Add to Home Screen.<br>Desktop (Chrome/Edge): install icon in the address bar.</p>`}</div>
<div class="card"><h2>About</h2><p class="mu">Mongkol Borei 2 – Community Engagement and Sponsorship Plan.<br>Fiscal year FY27 (Oct 2026 – Sep 2027), USD. Plan amounts come from the iMPAQ template. Transactions are stored only in this browser on this device; use Backup to keep a copy.</p></div></div>`}

/* ---------- shell ---------- */
const VIEWS={dash:vDash,tx:vTx,plan:vPlan,var:vVar,set:vSet},TBL={tx:tblTx,plan:tblPlan,var:tblVar};
function applyTheme(){const t=S.cfg.theme;if(t=='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=t}
function render(){applyTheme();
  const nav=NAV.map(([k,l])=>`<button class="nv" data-a="go" data-v="${k}" ${S.tab==k?'aria-current="page"':''}>${ico(k)}<span>${l}</span></button>`).join('');
  $('#side').innerHTML=`<div class="brand"><img src="icons/icon-192.png" alt=""><div><b>Budget Monitor</b><small>Mongkol Borei 2 · FY27</small></div></div>${nav}<div class="fy">Oct 2026 – Sep 2027<br>Currency: USD</div>`;
  $('#tabs').innerHTML=nav;$('#ttl').textContent=TITLE[S.tab];
  $('#mp').hidden=!['dash','var'].includes(S.tab);$('#mp').innerHTML=M.map((m,i)=>`<option value="${i}" ${i==S.mi?'selected':''}>${m}</option>`).join('');
  $('#view').innerHTML=VIEWS[S.tab]()}
function toast(msg,undo){const t=document.createElement('div');t.className='tt';t.innerHTML=`<span>${esc(msg)}</span>${undo?'<button>Undo</button>':''}`;
  if(undo)t.querySelector('button').onclick=()=>{undo();t.remove()};$('#toast').append(t);setTimeout(()=>t.remove(),5000)}
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
const csvq=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const exportCsv=()=>{dl('actual-spending-FY27.csv','Date,Activity,T2 account,Description,Amount,Voucher\n'+txRows().map(t=>[t.d,t.a,t.t,t.x,t.m,t.r].map(csvq).join(',')).join('\n'),'text/csv');toast('CSV exported')};

/* ---------- add / edit dialog ---------- */
let editId=null;
const dlg=$('#dlg');
$('#alist').innerHTML=D.A.map(r=>`<option value="${r[0]} – ${esc(short(r[1]))}">`).join('');
$('#ft').innerHTML=D.T.map(r=>`<option value="${r[0]}">${esc(r[0]+' – '+short(r[1]))}</option>`).join('');
const parseAct=v=>{const m=/^\s*(\d{2}\.\d{2}\.\d{2})/.exec(v||'');return m?m[1]:''};
function openDlg(id){editId=id||null;const t=S.tx.find(x=>x.id==id),today=new Date().toISOString().slice(0,10);
  $('#dt').textContent=t?'Edit expense':'Add expense';$('#fe').textContent='';
  $('#fd').min='2026-10-01';$('#fd').max='2027-09-30';
  const fb=()=>{const k=9+S.mi;return `${2026+Math.floor(k/12)}-${String(k%12+1).padStart(2,'0')}-01`};
  $('#fd').value=t?t.d:(today>='2026-10-01'&&today<='2027-09-30'?today:fb());
  $('#fm').value=t?t.m:'';const a=t&&D.A.find(r=>r[0]==t.a);$('#fa').value=a?`${a[0]} – ${short(a[1])}`:'';
  $('#ft').value=t?t.t:D.T[0][0];$('#fx').value=t?t.x:'';$('#fr').value=t?t.r:'';dlg.showModal();setTimeout(()=>$((t?'#fm':'#fm')).focus(),50)}
$('#fa').addEventListener('change',e=>{const c=parseAct(e.target.value);if(c&&D.T2of[c])$('#ft').value=D.T2of[c]});
$('#frm').addEventListener('submit',e=>{e.preventDefault();
  const d=$('#fd').value,m=parseFloat($('#fm').value),raw=$('#fa').value.trim(),a=parseAct(raw),er=$('#fe');
  if(!d||mIdx(d)<0||mIdx(d)>11)return er.textContent='Choose a date inside the fiscal year (Oct 2026 – Sep 2027).';
  if(!isFinite(m)||m<=0)return er.textContent='Enter an amount greater than 0.';
  if(raw&&!D.A.some(r=>r[0]==a))return er.textContent='Pick an activity from the list, or leave it empty for a support cost.';
  const o={d,a,t:$('#ft').value,m:Math.round(m*100)/100,x:$('#fx').value.trim(),r:$('#fr').value.trim()};
  if(editId){Object.assign(S.tx.find(x=>x.id==editId),o);toast('Transaction updated')}else{S.tx.push({id:'u'+Date.now(),...o});S.mi=mIdx(d);toast('Expense added')}
  save();dlg.close();render()});
dlg.addEventListener('click',e=>{if(e.target==dlg)dlg.close()});

/* ---------- actions ---------- */
const delTx=id=>{const i=S.tx.findIndex(x=>x.id==id),t=S.tx[i];S.tx.splice(i,1);save();render();toast('Transaction deleted',()=>{S.tx.push(t);save();render()})};
const clearSample=()=>{S.tx=S.tx.filter(t=>!String(t.id).startsWith('s'));S.sample=false;save();render();toast('Sample data cleared')};
const reset=()=>{if(confirm('Delete ALL transactions and settings on this device?')){S.tx=[];S.sample=false;S.cfg={watch:80,over:100,theme:'auto'};save();render();toast('Everything was reset')}};
const backup=()=>{dl('budget-fy27-backup.json',JSON.stringify({app:'bms-fy27',tx:S.tx,cfg:S.cfg},null,1),'application/json');toast('Backup downloaded')};
const A={go:v=>{S.tab=v;S.q='';S.flt='all';render();scrollTo(0,0)},add:()=>openDlg(),edit:v=>openDlg(v),del:delTx,close:()=>dlg.close(),
  view:v=>{S.view=v;render()},flt:v=>{S.flt=v;render()},csv:exportCsv,backup,clr:clearSample,rst:reset,restore:()=>$('#rf').click(),
  install:async()=>{if(ip){ip.prompt();await ip.userChoice;ip=null;render()}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&!b.disabled)return A[b.dataset.a]?.(b.dataset.v);
  const r=e.target.closest('rect[data-m]');if(r){S.mi=+r.dataset.m;save();render()}});
document.addEventListener('input',e=>{if(e.target.dataset.i=='q'){S.q=e.target.value;const f=TBL[S.tab];if(f)$('#tbl').innerHTML=f()}});
document.addEventListener('change',e=>{const k=e.target.dataset.c,v=e.target.value;if(!k)return;
  if(k=='mi'){S.mi=+v;save()}else if(k=='tf'){S.tf=v}else if(k=='theme'){S.cfg.theme=v;save()}
  else{const n=Math.max(1,parseFloat(v)||80);S.cfg[k]=n;save()}render()});
$('#rf').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{try{const j=JSON.parse(rd.result);if(!Array.isArray(j.tx))throw 0;S.tx=j.tx.map((t,i)=>({id:t.id||'u'+Date.now()+i,d:String(t.d),a:t.a||'',t:String(t.t||''),m:+t.m||0,x:t.x||'',r:t.r||''}));
    S.sample=S.tx.some(t=>String(t.id).startsWith('s'));if(j.cfg)Object.assign(S.cfg,j.cfg);save();render();toast('Backup restored')}catch(x){toast('That file is not a valid backup')}e.target.value=''};rd.readAsText(f)});
addEventListener('beforeinstallprompt',e=>{e.preventDefault();ip=e;if(S.tab=='set')render()});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
render();
