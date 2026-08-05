// Shelly Plus Plug S
// HTTP-JSON-Parser mit WebUI
// Aufruf: http://SHELLY-IP/script/1/site


// ============================================================
// Kapitel 1: HTML-Hilfsfunktionen
// ============================================================

function page(content) {
  return "<!doctype html><meta charset=utf-8>" +
    "<meta name=viewport content='width=device-width,initial-scale=1'>" +
    "<title>Shelly Sensor</title>" +
    "<style>" +
    "body{font:16px sans-serif;max-width:600px;margin:20px}" +
    "input,select{font:16px;padding:7px;margin:4px 0;width:100%}" +
    "#value{font-size:26px;font-weight:bold;margin-top:14px}" +
    "#info{color:#666;margin-top:8px}" +
    "</style>" +
    content;
}

function jsonResponse(res, code, data) {
  res.code = code;
  res.headers = [["Content-Type", "application/json"]];
  res.body = JSON.stringify(data);
  res.send();
}


// ============================================================
// Kapitel 2: Parser für Sensorblöcke
// ============================================================

function parseBlocks(json) {
  let blocks = [];

  for (let key in json) {
    if (!json.hasOwnProperty(key)) {
      continue;
    }

    let item = json[key];

    // Block mit value/unit/timestamp
    if (item !== null && typeof item === "object") {
      if (item.hasOwnProperty("value")) {
        blocks.push({
          name: key,
          value: item.value,
          unit: item.hasOwnProperty("unit") ? item.unit : "",
          timestamp: item.hasOwnProperty("timestamp")
            ? item.timestamp
            : ""
        });
      }
    }

    // Direkter Einzelwert, z. B. {"W": 123}
    else {
      blocks.push({
        name: key,
        value: item,
        unit: "",
        timestamp: ""
      });
    }
  }

  return blocks;
}


// ============================================================
// Kapitel 3: HTTP-Sensorabfrage
// ============================================================

HTTPServer.registerEndpoint("fetch", function(req, res) {
  let url = req.body || "";

  // Unterstützung für Formularübertragung: url=http://...
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
    jsonResponse(res, 400, {
      error: "Ungültige URL"
    });
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

    if (json === null || typeof json !== "object") {
      jsonResponse(res, 502, {
        error: "JSON enthält kein Objekt"
      });
      return;
    }

    jsonResponse(res, 200, {
      blocks: parseBlocks(json)
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

    "<select id=block disabled>" +
    "<option>URL eingeben</option>" +
    "</select>" +

    "<div id=value>–</div>" +
    "<div id=info></div>" +

    "<script>" +

    "var url=document.getElementById('url');" +
    "var block=document.getElementById('block');" +
    "var value=document.getElementById('value');" +
    "var info=document.getElementById('info');" +
    "var blocks=[];" +

    "function updateValue(){" +
      "for(var i=0;i<blocks.length;i++){" +
        "if(blocks[i].name===block.value){" +
          "value.textContent=String(blocks[i].value)+" +
            "(blocks[i].unit?' '+blocks[i].unit:'');" +

          "info.textContent=blocks[i].timestamp||'';" +
          "return;" +
        "}" +
      "}" +

      "value.textContent='–';" +
      "info.textContent='';" +
    "}" +

    "function updateBlocks(data){" +
      "var newBlocks=data.blocks||[];" +
      "var changed=newBlocks.length!==blocks.length;" +

      "if(!changed){" +
        "for(var i=0;i<newBlocks.length;i++){" +
          "if(newBlocks[i].name!==blocks[i].name){" +
            "changed=true;" +
            "break;" +
          "}" +
        "}" +
      "}" +

      "blocks=newBlocks;" +

      "if(changed){" +
        "var old=block.value;" +
        "block.innerHTML='';" +

        "for(var i=0;i<blocks.length;i++){" +
          "var option=document.createElement('option');" +
          "option.value=blocks[i].name;" +
          "option.textContent=blocks[i].name;" +
          "block.appendChild(option);" +
        "}" +

        "block.disabled=blocks.length===0;" +

        "if(blocks.length){" +
          "block.value=old;" +

          "if(block.selectedIndex<0){" +
            "block.selectedIndex=0;" +
          "}" +
        "}" +
      "}" +

      "if(blocks.length){" +
        "updateValue();" +
      "}else{" +
        "value.textContent='Keine Sensorblöcke erkannt';" +
        "info.textContent='';" +
      "}" +
    "}" +

    "function readSensor(){" +
      "if(!url.value)return;" +

      "fetch('fetch',{" +
        "method:'POST'," +
        "body:url.value" +
      "})" +
      ".then(function(r){return r.json();})" +
      ".then(function(data){" +
        "if(data.error){" +
          "info.textContent=data.error;" +
          "return;" +
        "}" +
        "updateBlocks(data);" +
      "})" +
      ".catch(function(){" +
        "info.textContent='Abfrage fehlgeschlagen';" +
      "});" +
    "}" +

    "block.onchange=updateValue;" +
    "url.onchange=readSensor;" +
    "setInterval(readSensor,5000);" +

    "</script>"
  );

  res.send();
});