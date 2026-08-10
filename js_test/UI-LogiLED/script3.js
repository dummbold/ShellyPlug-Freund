// LogiLED – Script 3
var SCRIPT_1 = 1, SCRIPT_2 = 2, SCRIPT_3 = 3;

function configureStartup() {
  Shelly.call("Script.Stop", { id: SCRIPT_1 });
  Shelly.call("Script.SetConfig", { id: SCRIPT_1, config: { enable: false, auto_start: false } });
  Shelly.call("Script.Stop", { id: SCRIPT_2 });
  Shelly.call("Script.SetConfig", { id: SCRIPT_2, config: { enable: false, auto_start: false } });
  Shelly.call("Script.SetConfig", { id: SCRIPT_3, config: { auto_start: true } });
}
configureStartup();

function page() {
  return "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>LogiLED</title><style>"+
  ":root{--b:#11191f;--c:#18232c;--l:#2b3b47;--t:#d7e0e6;--m:#91a0aa;--a:#1497c5}*{box-sizing:border-box}body{margin:0;background:var(--b);color:var(--t);font:16px system-ui}header,footer{background:#141e26;border-color:var(--l)}header{border-bottom:1px solid}.s{max-width:1050px;margin:auto;padding:0 18px}.head{height:65px;display:flex;align-items:center;gap:24px}.brand{font-weight:600;color:#fff}.nav{flex:1;color:var(--a);height:100%;display:flex;align-items:end}.nav b{padding:0 3px 17px;border-bottom:3px solid}.icons{color:var(--m);display:flex;gap:16px}.icon{user-select:none}main{min-height:calc(100vh - 145px);padding:22px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.card{background:var(--c);border:1px solid var(--l);border-radius:6px;padding:18px}.card h2{font-size:1.05rem;margin:0 0 16px;color:#fff}.out{grid-row:span 2}.outbody{min-height:260px;display:flex;align-items:center;justify-content:center;gap:25px}.ring{width:160px;height:160px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--a) 0 70%,#33434e 70%)}.ring:after{content:'';grid-area:1/1;width:134px;height:134px;border-radius:50%;background:var(--c)}.power{grid-area:1/1;z-index:1;font-size:45px;color:var(--m)}.buttons{display:flex;flex-direction:column;gap:8px}.buttons button{width:145px;padding:9px;background:#243540;color:var(--t);border:1px solid var(--l);border-radius:4px;text-align:left;font:inherit}.row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--l)}.muted{color:var(--m)}footer{border-top:1px solid}.foot{height:80px;display:flex;align-items:center;justify-content:space-between;color:var(--m);font-size:.85rem}@media(max-width:650px){.grid{grid-template-columns:1fr}.out{grid-row:auto}.outbody{flex-direction:column}.foot{padding:12px 0;height:auto;gap:8px;align-items:flex-start;flex-direction:column}}</style>"+
  "<header><div class='s head'><strong class=brand>Shelly</strong><nav class=nav><b>LogiLED</b></nav><div class=icons aria-hidden=true><span class=icon>◌</span><span class=icon>⚙</span><span class=icon>⋮</span></div></div></header>"+
  "<main><div class='s grid'><section class='card out'><h2>OUTPUT()</h2><div class=outbody><div class=ring><div class=power>⏻</div></div><div class=buttons><button>Power</button><button>Animation</button><button>Einstellungen</button></div></div></section>"+
  "<section class=card><h2>Leistung</h2><div class=row><span class=muted>Aktuell</span><strong id=p>—</strong></div><div class=row><span class=muted>Spannung</span><strong id=v>—</strong></div><div class=row><span class=muted>Strom</span><strong id=i>—</strong></div></section>"+
  "<section class=card><h2>Status</h2><div class=row><span class=muted>Ausgang</span><strong id=o>—</strong></div><div class=row><span class=muted>Temperatur</span><strong id=t>—</strong></div></section></div></main>"+
  "<footer><div class='s foot'><span id=d>LogiLED</span><span id=f>—</span></div></footer><script>"+
  "function x(i,v){document.getElementById(i).textContent=v==null?'—':v}function j(u){return fetch(u).then(function(r){return r.json()})}Promise.all([j('/rpc/Switch.GetStatus?id=0'),j('/rpc/Shelly.GetDeviceInfo')]).then(function(a){var s=a[0],d=a[1];x('p',s.apower+' W');x('v',s.voltage+' V');x('i',s.current+' A');x('o',s.output?'Ein':'Aus');x('t',s.temperature&&s.temperature.tC+' °C');x('d',d.name||d.id);x('f',d.ver?'Shelly '+d.ver:'—')}).catch(function(){x('f','Daten nicht verfügbar')});</script>"+
  "</body>";
}

HTTPServer.registerEndpoint("site", function(req, res) {
  res.code = 200;
  res.headers = [["Content-Type", "text/html; charset=utf-8"]];
  res.body = page();
  res.send();
});
