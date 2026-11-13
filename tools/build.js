const fs=require("fs");
let s=fs.readFileSync(__dirname+"/app-src.html","utf8");
const snap=JSON.parse(fs.readFileSync(__dirname+"/snapshot.json","utf8"));
const stamp=process.argv[2];
const media=JSON.parse(fs.readFileSync(__dirname+"/media.json","utf8"));
const PH="📷 صورة الدليل موجودة بالنسخة الكاملة";
for (const [rid,m] of Object.entries(media)) {
  if (m.logo && !snap.some(e=>e.rid===rid&&e.field==="logo")) snap.push({rid,field:"logo",assetId:m.logo,at:1});
  if (m.ev.length) {
    const imgs=m.ev.map(n=>({type:"image",assetId:n}));
    const docs=snap.filter(e=>e.rid===rid&&(e.field==="add"||e.field==="verdict")&&Array.isArray(e.evidence));
    const d=docs.find(e=>e.evidence.some(x=>x.text===PH))||docs.find(e=>e.field==="add");
    if (d) d.evidence=[...imgs,...d.evidence.filter(x=>x.text!==PH)];
    else snap.push({rid,field:"verdict",meat:"same",chicken:"same",evidence:imgs,at:2});
  }
}
const css=`
  body.view #addBtn, body.view #askBtn, body.view #undoBtn, body.view #qaBtn, body.view #trashBtn, body.view #statsBtn, body.view #expBtn,
  body.view .act[data-act="edit"], body.view .act[data-act="undo1"], body.view .act[data-act="del"], body.view .act[data-act="report"],
  body.view .act[data-act="menu"], body.view .act[data-act="shareimg"], body.view .logo .addp, body.view #emptyAdd { display:none !important; }
  .viewbar { margin: 10px 14px 0; padding: 11px 14px; border-radius: 16px; background: var(--card, #fff); box-shadow: 0 2px 10px rgba(0,0,0,.08); font-size: 14px; line-height: 1.7; text-align: center; }
  .viewbar a { display: inline-block; margin-top: 6px; padding: 7px 14px; border-radius: 12px; background: var(--brand, #1d4fbf); color: #fff; font-weight: 800; text-decoration: none; }
  .viewbar small { display:block; opacity:.7; font-size: 12px; }
`;
s=s.split("/_blob/").join("img/");
s=s.replace("</style>", css+"</style>");
s=s.replace(/<body([^>]*)>/, (m,a)=>`<body${a.replace(/class="([^"]*)"/,'class="$1 view"')}${/class=/.test(a)?"":' class="view"'}>
<div class="viewbar">👀 هذي نسخة التصفّح، تفتح لأي أحد بدون تسجيل<small>آخر تحديث: ${stamp}</small><a href="https://claude.ai/artifact/Mo9PveYVKT7zgCR16x7RVF" target="_blank" rel="noopener">✏️ تبي تضيف أو تعدّل؟ النسخة الكاملة</a></div>`);
s=s.replace("(async () => {", "window.HALAL_SNAP = "+JSON.stringify(snap)+";\n(async () => {\n  if (window.HALAL_SNAP) { edits = window.HALAL_SNAP.map((e, i) => ({ id: \"s\" + i, ...e })); try { loadRules(); } catch (e) {} render(); try { checkNews(); } catch (e) {} return; }");
// goatcounter
s=s.replace("</body>", `<script>try{var px=new Image();var sa=window.navigator.standalone===true||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches);px.src="https://halalkw.goatcounter.com/count?p="+encodeURIComponent(sa?"/فتح-التطبيق":"/تصفح")+"&t="+encodeURIComponent(sa?"فتح التطبيق":"تصفح")+"&s="+screen.width+"&rnd="+Math.random().toString(36).slice(2);}catch(e){}</script>\n</body>`);
fs.writeFileSync(__dirname+"/../app.html", s);
