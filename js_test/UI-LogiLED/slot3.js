// LogLED WebUI fuer Shelly Plus Plug S / Slot 3
// Aufruf: http://<SHELLY-IP>/script/3/site

function page() {
  return "<!doctype html><html><head><meta charset=utf-8>" +
    "<meta name=viewport content='width=device-width,initial-scale=1'>" +
    "<title>LogLED</title><style>" +
    "*{box-sizing:border-box}body{margin:0;background:#f4f4f4;color:#252525;font:14px Arial,sans-serif}" +
    ".top{height:58px;background:#fff;border-bottom:1px solid #ddd;display:flex;align-items:center;padding:0 18px;gap:18px}" +
    ".hamb{font-size:25px;color:#444}.name{font-size:18px;flex:1}.icons{display:flex;gap:15px;color:#aaa;font-size:18px;pointer-events:none}" +
    ".warn{margin:16px auto 0;max-width:760px;background:#fff3cd;border:1px solid #ecd58a;padding:13px 16px;border-radius:7px;color:#5f501e}" +
    ".nav{max-width:760px;margin:16px auto 0;padding:0 4px;color:#555}.nav div{display:inline-block;background:#fff;border-radius:5px;padding:10px 16px;color:#222;font-weight:bold}" +
    ".main{max-width:760px;margin:14px auto;padding:0 4px}.card{background:#fff;border-radius:10px;box-shadow:0 1px 3px #0002;padding:18px 18px 22px}" +
    ".head{display:flex;align-items:center;margin-bottom:20px}.head b{font-size:17px}.dots{margin-left:auto;color:#999;letter-spacing:3px}" +
    ".values{display:flex;flex-wrap:wrap;gap:10px;min-height:28px}.pill{border:1px solid #ddd;border-radius:18px;padding:8px 12px;background:#fafafa;color:#444}.pill strong{font-weight:normal;color:#111}" +
    ".switch{width:88px;height:88px;border:7px solid #e3e3e3;border-radius:50%;margin:25px auto 0;background:#f7f7f7;color:#999;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:default}" +
    ".foot{max-width:760px;margin:22px auto;padding:0 8px 20px;color:#888;font-size:12px;line-height:1.7}.foot span{margin-right:8px}" +
    "@media(max-width:600px){.top{padding:0 12px}.icons{gap:9px}.main,.nav,.warn{margin-left:10px;margin-right:10px}}" +
    "</style></head><body><header class=top><span class=hamb>☰</span><span class=name>PlugS Gen3 - Test</span>" +
    "<span class=icons aria-hidden=true>⌁ ◉ ♢ ◌</span></header>" +
    "<div class=warn><b>Device is in safe mode!</b> Scripts are not automatically executed, schedules and webhooks are disabled and eco mode is not activated.</div>" +
    "<nav class=nav><div>LogLED</div></nav><main class=main><section class=card>" +
    "<div class=head><b>Output (0)</b><span class=dots>•••</span></div>" +
    "<div id=values class=values></div><div id=switch class=switch>OFF</div>" +
    "</section></main><footer class=foot><div id=device>Shelly PlugS Gen3</div><div id=details></div><span>Feedback</span></footer>" +
    "<script>(function(){var v=document.getElementById('values'),sw=document.getElementById('switch'),d=document.getElementById('details');" +
    "function text(x){return x===null||x===undefined||x===''?null:String(x)}" +
    "function add(label,value,unit){value=text(value);if(value===null)return;var e=document.createElement('span');e.className='pill';e.innerHTML=label+' <strong>'+value+(unit?' '+unit:'')+'</strong>';v.appendChild(e)}" +
    "function draw(s,i){var o=s&&s['switch:0'];if(!o)return;v.innerHTML='';add('',o.voltage,'V');add('',o.freq,'Hz');add('→',o.aenergy&&o.aenergy.total,'Wh');add('',o.apower,'W');sw.textContent=text(o.output)===null?'':o.output?'ON':'OFF'}" +
    "function details(i){if(!i)return;var a=[];if(text(i.id)!==null)a.push(i.id);if(text(i.ver)!==null)a.push(i.ver);if(text(i.fw_id)!==null)a.push(i.fw_id);d.textContent=a.join(' | ')}" +
    "function load(){Promise.all([fetch('/rpc/Shelly.GetStatus').then(function(r){return r.json()}),fetch('/rpc/Shelly.GetDeviceInfo').then(function(r){return r.json()})]).then(function(x){draw(x[0],x[1]);details(x[1])}).catch(function(){})}" +
    "load();setInterval(load,5000)})()</script></body></html>";
}

HTTPServer.registerEndpoint("site", function(req, res) {
  res.code = 200;
  res.headers = [["Content-Type", "text/html; charset=utf-8"]];
  res.body = page();
  res.send();
});