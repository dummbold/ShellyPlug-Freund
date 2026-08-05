// Shelly Plus Plug S
// HTTP-JSON-Parser mit schlankem WebUI
//
// Aufruf:
// http://SHELLY-IP/script/1/site

// ============================================================
// Kapitel 1: Hilfsfunktionen
// ============================================================

function esc(s) {
  s = "" + (s || "");
  return s.split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split('"').join("&quot;");
}

function page(content) {
  return "<!doctype html><meta charset=utf-8>" +
    "<meta name=viewport content='width=device-width,initial-scale=1'>" +
    "<title>Shelly Sensor</title>" +
    "<style>" +
    "body{font:16px sans-serif;max-width:600px;margin:20px}" +
    "input,select,button{font:16px;padding:6px;margin:3px 0;width:100%}" +
    "#value{font-size:24px;font-weight:bold;margin-top:12px}" +
    "#status{color:#666;margin-top:8px}" +
    "</style>" +
    content;
}

function jsonResponse(res, code, object) {
  res.code = code;
  res.headers = [["Content-Type", "application/json"]];
  res.body = JSON.stringify(object);
  res.send();
}

// ============================================================
// Kapitel 2: JSON-Parser
// ============================================================

function parseValues(value, path, fields) {
  let type = typeof value;

  if (value === null ||
      type === "number" ||
      type === "string" ||
      type === "boolean") {
    fields.push({
      path: path,
      value: value
    });
    return;
  }

  if (type === "object") {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        parseValues(value[i], path + "[" + i + "]", fields);
      }
    } else {
      for (let key in value) {
        if (value.hasOwnProperty(key)) {
          let nextPath = path ? path + "." + key : key;
          parseValues(value[key], nextPath, fields);
        }
      }
    }
  }
}

// ============================================================
// Kapitel 3: Sensor abfragen und geparste Werte liefern
// ============================================================

HTTPServer.registerEndpoint("fetch", function (req, res) {
  if (req.method !== "POST") {
    jsonResponse(res, 405, {error: "POST erforderlich"});
    return;
  }

  let url = req.body || "";

  // Unterstützt Formularübertragung: url=http://...
  if (url.indexOf("url=") === 0) {
    url = url.slice(4);
  }

  let end = url.indexOf("\n");
  if (end >= 0) {
    url = url.slice(0, end);
  }

  if (url.charAt(url.length - 1) === "\r") {
    url = url.slice(0, -1);
  }

  if (url.indexOf("http://") !== 0 &&
      url.indexOf("https://") !== 0) {
    jsonResponse(res, 400, {error: "Ungültige URL"});
    return;
  }

  Shelly.call("HTTP.GET", {
    url: url,
    timeout: 8
  }, function(result, errorCode, errorMessage) {
    if (errorCode !== 0) {
      jsonResponse(res, 502, {
        error: "HTTP " + errorCode + ": " + errorMessage
      });
      return;
    }

    let json;

    try {
      json = JSON.parse(result.body || "");
    } catch (e) {
      jsonResponse(res, 502, {
        error: "Antwort ist kein gültiges JSON"
      });
      return;
    }

    let fields = [];
    parseValues(json, "", fields);

    jsonResponse(res, 200, {
      fields: fields
    });
  });
});

// ============================================================
// Kapitel 4: WebUI
// ============================================================

HTTPServer.registerEndpoint("site", function(req, res) {
  res.headers = [["Content-Type", "text/html"]];

  res.body = page(
    "<h2>Sensorwerte</h2>" +

    "<input id=url " +
    "placeholder='http://192.168.1.10/sensor.json'>" +

    "<select id=field disabled>" +
    "<option>Sensor zuerst abfragen</option>" +
    "</select>" +

    "<div id=value>–</div>" +
    "<div id=status></div>" +

    "<script>" +

    "var url=document.getElementById('url');" +
    "var field=document.getElementById('field');" +
    "var value=document.getElementById('value');" +
    "var status=document.getElementById('status');" +
    "var fields=[];" +

    "function showFields(data){" +
      "var old=field.value;" +
      "fields=data.fields||[];" +
      "field.innerHTML='';" +

      "for(var i=0;i<fields.length;i++){" +
        "var o=document.createElement('option');" +
        "o.value=fields[i].path;" +
        "o.textContent=fields[i].path;" +
        "field.appendChild(o);" +
      "}" +

      "field.disabled=fields.length===0;" +

      "if(fields.length){" +
        "field.value=old;" +
        "if(field.selectedIndex<0)field.selectedIndex=0;" +
        "showValue();" +
      "}else{" +
        "value.textContent='Keine Werte erkannt';" +
      "}" +
    "}" +

    "function showValue(){" +
      "for(var i=0;i<fields.length;i++){" +
        "if(fields[i].path===field.value){" +
          "value.textContent=String(fields[i].value);" +
          "return;" +
        "}" +
      "}" +
      "value.textContent='–';" +
    "}" +

    "function readSensor(){" +
      "if(!url.value)return;" +

      "fetch('fetch',{" +
        "method:'POST'," +
        "body:url.value" +
      "}).then(function(r){return r.json();})" +
      ".then(function(data){" +
        "if(data.error){" +
          "status.textContent=data.error;" +
          "return;" +
        "}" +
        "status.textContent='aktualisiert: '+new Date().toLocaleTimeString();" +
        "showFields(data);" +
      "})" +
      ".catch(function(){" +
        "status.textContent='Abfrage fehlgeschlagen';" +
      "});" +
    "}" +

    "field.onchange=showValue;" +
    "url.onchange=readSensor;" +
    "setInterval(readSensor,5000);" +

    "</script>"
  );

  res.send();
});