// LogiLED – Script 3
// WebUI-Grundgerüst im Shelly-Style

var SCRIPT_1 = 1;
var SCRIPT_2 = 2;
var SCRIPT_3 = 3;

function configureStartup() {
  Shelly.call("Script.Stop", { id: SCRIPT_1 });
  Shelly.call("Script.SetConfig", {
    id: SCRIPT_1,
    config: { enable: false, auto_start: false }
  });

  Shelly.call("Script.Stop", { id: SCRIPT_2 });
  Shelly.call("Script.SetConfig", {
    id: SCRIPT_2,
    config: { enable: false, auto_start: false }
  });

  Shelly.call("Script.SetConfig", {
    id: SCRIPT_3,
    config: { auto_start: true }
  });
}

configureStartup();

function page() {
  return "<!doctype html>" +
    "<html lang='de'><head>" +
    "<meta charset='utf-8'>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<title>LogiLED</title>" +
    "<style>" +
    ":root{color-scheme:dark;--bg:#11191f;--card:#18232c;--line:#2b3b47;--text:#d7e0e6;--muted:#91a0aa;--blue:#1497c5;--green:#35b85a}" +
    "*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px system-ui,-apple-system,Segoe UI,sans-serif}" +
    "header,footer{border-color:var(--line);background:#141e26}.shell{width:min(1120px,100%);margin:auto;padding:0 18px}" +
    "header{border-bottom:1px solid var(--line)}.head{min-height:66px;display:flex;align-items:center;gap:24px}" +
    ".brand{font-size:1.05rem;font-weight:600;color:#fff;white-space:nowrap}.nav{display:flex;align-items:center;gap:10px;flex:1}" +
    ".nav-item{padding:22px 4px 18px;color:var(--blue);border-bottom:3px solid var(--blue)}" +
    ".icons{display:flex;gap:18px;color:var(--muted);font-size:1.25rem}.icon{display:inline-block;opacity:.75;user-select:none}" +
    "main{min-height:calc(100vh - 146px);padding:24px 0 32px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}" +
    ".card{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:20px;box-shadow:0 2px 8px #0003}" +
    ".card h2{margin:0 0 18px;font-size:1.05rem;color:#fff;font-weight:600}.output{grid-row:span 2}" +
    ".output-body{display:flex;align-items:center;justify-content:center;gap:30px;min-height:270px}.power-ring{width:170px;height:170px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--blue) 0 70%,#33434e 70%)}" +
    ".power-ring:after{content:'';grid-area:1/1;width:142px;height:142px;border-radius:50%;background:var(--card)}.power-symbol{grid-area:1/1;z-index:1;font-size:3rem;color:var(--muted)}" +
    ".output-buttons{display:flex;flex-direction:column;gap:9px}.output-buttons button{min-width:150px}" +
    "button{padding:10px 14px;border:1px solid var(--line);border-radius:4px;background:#243540;color:var(--text);font:inherit;text-align:left;cursor:pointer}" +
    "button:hover{border-color:var(--blue)}.value{font-size:1.8rem;color:#fff}.muted{color:var(--muted)}.row{display:flex;justify-content:space-between;gap:16px;padding:9px 0;border-bottom:1px solid var(--line)}.row:last-child{border-bottom:0}" +
    "footer{border-top:1px solid var(--line);color:var(--muted);font-size:.85rem}.foot{min-height:80px;display:flex;align-items:center;justify-content:space-between;gap:16px}" +
    "@media(max-width:700px){.grid{grid-template-columns:1fr}.output{grid-row:auto}.output-body{flex-direction:column}.head{gap:14px}.icons{gap:10px}.foot{align-items:flex-start;flex-direction:column;padding:16px 0}}" +
    "</style></head><body>" +
    "<header><div class='shell head'><div class='brand'>Shelly</div>" +
    "<nav class='nav'><div class='nav-item'>LogiLED</div></nav>" +
    "<div class='icons' aria-hidden='true'><span class='icon'>◌</span><span class='icon'>⚙</span><span class='icon'>⋮</span></div>" +
    "</div></header>" +
    "<main><div class='shell'><div class='grid'>" +
    "<section class='card output'><h2>OUTPUT()</h2><div class='output-body'>" +
    "<div class='power-ring'><div class='power-symbol'>⏻</div></div>" +
    "<div class='output-buttons'><button type='button'>Power</button><button type='button'>Animation</button><button type='button'>Einstellungen</button></div>" +
    "</div></section>" +
    "<section class='card'><h2>Leistung</h2><div class='row'><span class='muted'>Aktuell</span><strong id='power'>—</strong></div><div class='row'><span class='muted'>Spannung</span><strong id='voltage'>—</strong></div><div class='row'><span class='muted'>Strom</span><strong id='current'>—</strong></div></section>" +
    "<section class='card'><h2>Status</h2><div class='row'><span class='muted'>Ausgang</span><strong id='output'>—</strong></div><div class='row'><span class='muted'>Temperatur</span><strong id='temperature'>—</strong></div></section>" +
    "</div></div></main>" +
    "<footer><div class='shell foot'><span id='device'>LogiLED</span><span id='firmware'>—</span></div></footer>" +
    "<script>" +
    "function setText(id,value){document.getElementById(id).textContent=value===undefined||value===null?'—':String(value)}" +
    "function getJson(url){return fetch(url).then(function(r){if(!r.ok)throw Error(r.status);return r.json()})}" +
    "Promise.all([getJson('/rpc/Switch.GetStatus?id=0'),getJson('/rpc/Shelly.GetDeviceInfo')]).then(function(data){" +
    "var s=data[0],d=data[1];setText('power',s.apower===undefined?'—':s.apower+' W');setText('voltage',s.voltage===undefined?'—':s.voltage+' V');setText('current',s.current===undefined?'—':s.current+' A');setText('output',s.output?'Ein':'Aus');setText('temperature',s.temperature&&s.temperature.tC!==undefined?s.temperature.tC+' °C':'—');setText('device',d.name||d.id||'LogiLED');setText('firmware',d.ver?'Shelly '+d.ver:'—')}).catch(function(){setText('firmware','Daten nicht verfügbar')});" +
    "</script></body></html>";
}

HTTPServer.registerEndpoint("site", function(req, res) {
  res.code = 200;
  res.headers = [["Content-Type", "text/html; charset=utf-8"]];
  res.body = page();
  res.send();
});
