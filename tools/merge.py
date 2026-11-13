#!/usr/bin/env python3
"""يدمج تعديلات جديدة من قاعدة بيانات «حلال» في snapshot.json ثم يبني app.html.
الاستعمال: python3 tools/merge.py new.jsonl
new.jsonl: سطر لكل مستند من db_query (كل سطر فيه "data" أو المستند نفسه)."""
import json, sys, os, subprocess, datetime
D = os.path.dirname(os.path.abspath(__file__))
snap = json.load(open(f"{D}/snapshot.json", encoding="utf8"))
KEEP = ("rid","field","name","en","types","meat","chicken","value","note","at","phone","whatsapp","country","text","links")
seen = {(e["rid"], e["field"], e["at"]) for e in snap}
added = 0
for line in open(sys.argv[1], encoding="utf8"):
    line = line.strip()
    if not line.startswith("{"): continue
    d = json.loads(line); d = d.get("data", d)
    if d.get("field") not in ("add","verdict","del","order","meat","chicken"): continue
    if (d.get("rid"), d.get("field"), d.get("at")) in seen: continue
    e = {k: d[k] for k in KEEP if k in d}
    ev = []
    for x in d.get("evidence") or []:
        if x.get("type") == "link": ev.append(x)
        elif x.get("type") == "text" and not x.get("text","").startswith("من الصورة"): ev.append({"type":"text","text":x["text"]})
    if d.get("field") in ("add","verdict") and "evidence" in d:
        if not ev and any(x.get("type")=="image" for x in d["evidence"]): ev=[{"type":"text","text":"📷 صورة الدليل موجودة بالنسخة الكاملة"}]
        e["evidence"] = ev
    snap.append(e); seen.add((e["rid"], e["field"], e["at"])); added += 1
json.dump(snap, open(f"{D}/snapshot.json","w",encoding="utf8"), ensure_ascii=False, indent=0)
last = max(e["at"] for e in snap)
open(f"{D}/last_at.txt","w").write(str(last))
M = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
t = datetime.datetime.utcnow() + datetime.timedelta(hours=3)
subprocess.run(["node", f"{D}/build.js", f"{t.day} {M[t.month-1]} {t.year}"], check=True)
print("added", added, "last_at", last)
