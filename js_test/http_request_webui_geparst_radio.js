// ============================================================
// Kapitel 1: HTML-Hilfsfunktionen
// ============================================================

function esc(s) {
  s = "" + (s === undefined || s === null ? "" : s);

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
    "body{font:16px sans-serif;max-width:650px;margin:20px}" +
    "input,button{font:16px;padding:7px;margin:4px 0}" +
    "input[type=radio]{width:auto;margin-right:8px}" +
    ".row{padding:8px 4px;border-bottom:1px solid #ccc}" +
    ".row label{display:block;cursor:pointer}" +
    ".name{display:inline-block;min-width:220px}" +
    ".value{font-weight:bold}" +
    ".details{padding:8px;background:#eee}" +
    "#status{color:#666;margin-top:10px}" +
    "</style>" +
    content;
}


// ============================================================
// Kapitel 2: Universeller JSON-Parser
// ============================================================

function parseBlocks(json) {
  let blocks = [];
  let stack = [{
    value: json,
    path: ""
  }];

  while (stack.length > 0) {
    let entry = stack.pop();
    let value = entry.value;
    let path = entry.path;
    let type = typeof value;

    // Einzelwert
    if (value === null ||
        type === "string" ||
        type === "number" ||
        type === "boolean") {
      if (path) {
        blocks.push({
          name: path,
          value: value,
          unit: "",
          timestamp: "",
          details: []
        });
      }
      continue;
    }

    if (type !== "object") {
      continue;
    }

    // Kompakter Messwertblock mit value/unit/timestamp
    if (path &&
        !Array.isArray(value) &&
        value.hasOwnProperty("value") &&
        (typeof value.value !== "object" || value.value === null)) {
      let details = [];

      for (let key in value) {
        if (!value.hasOwnProperty(key)) {
          continue;
        }

        let detailType = typeof value[key];

        if (value[key] === null ||
            detailType === "string" ||
            detailType === "number" ||
            detailType === "boolean") {
          details.push({
            name: key,
            value: value[key]
          });
        }
      }

      blocks.push({
        name: path,
        value: value.value,
        unit: value.hasOwnProperty("unit") ? value.unit : "",
        timestamp: value.hasOwnProperty("timestamp")
          ? value.timestamp
          : "",
        details: details
      });

      continue;
    }

    // Arrays
    if (Array.isArray(value)) {
      for (let i = value.length - 1; i >= 0; i--) {
        stack.push({
          value: value[i],
          path: path + "[" + i + "]"
        });
      }

      continue;
    }

    // Objekte
    for (let key in value) {
      if (!value.hasOwnProperty(key)) {
        continue;
      }

      stack.push({
        value: value[key],
        path: path ? path + "." + key : key
      });
    }
  }

  return blocks;
}


// ============================================================
// Kapitel 3: HTTP-Abfrage und Auswahl
// ============================================================

let lastBlocks = [];

HTTPServer.registerEndpoint("fetch", function(req, res) {
  let url = req.body || "";

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

    lastBlocks = parseBlocks(json);

    jsonResponse(res, 200, {
      blocks: lastBlocks
    });
  });
});

function jsonResponse(res, code, data) {
  res.code = code;
  res.headers = [["Content-Type", "application/json"]];
  res.body = JSON.stringify(data);
  res.send();
}


// ============================================================
// Kapitel 4: WebUI mit Radiobutton-Auswahl
// ============================================================

HTTPServer.registerEndpoint("site", function(req, res) {
  res.headers = [["Content-Type", "text/html"]];

  res.body = page(
    "<h2>Sensorwert auswählen</h2>" +

    "<input id=url style='width:100%' " +
    "placeholder='http://192.168.1.10/sensor.json'>" +

    "<div id=list>URL eingeben</div>" +
    "<div id=status></div>" +

    "<script>" +

    "var url=document.getElementById('url');" +
    "var list=document.getElementById('list');" +
    "var status=document.getElementById('status');" +
    "var blocks=[];" +

    "function render(data){" +
      "blocks=data.blocks||[];" +
      "list.innerHTML='';" +

      "if(!blocks.length){" +
        "list.textContent='Keine Werte erkannt';" +
        "return;" +
      "}" +

      "var form=document.createElement('form');" +
      "form.id='choose';" +

      "for(var i=0;i<blocks.length;i++){" +
        "var row=document.createElement('div');" +
        "row.className='row';" +

        "var label=document.createElement('label');" +
        "var radio=document.createElement('input');" +
        "radio.type='radio';" +
        "radio.name='sensor';" +
        "radio.value=blocks[i].name;" +
        "if(i===0)radio.checked=true;" +

        "var name=document.createElement('span');" +
        "name.className='name';" +
        "name.textContent=blocks[i].name;" +

        "var val=document.createElement('span');" +
        "val.className='value';" +
        "val.textContent=String(blocks[i].value)+" +
          "(blocks[i].unit?' '+blocks[i].unit:'');" +

        "label.appendChild(radio);" +
        "label.appendChild(name);" +
        "label.appendChild(val);" +
        "row.appendChild(label);" +
        "form.appendChild(row);" +
      "}" +

      "var button=document.createElement('button');" +
      "button.type='submit';" +
      "button.textContent='Auswählen';" +
      "form.appendChild(button);" +

      "form.onsubmit=function(e){" +
        "e.preventDefault();" +
        "var selected=document.querySelector(" +
          "'input[name=sensor]:checked');" +

        "if(!selected)return;" +

        "fetch('select',{" +
          "method:'POST'," +
          "body:selected.value" +
        "})" +
        ".then(function(r){return r.text();})" +
        ".then(function(html){" +
          "document.open();" +
          "document.write(html);" +
          "document.close();" +
        "});" +
      "};" +

      "list.appendChild(form);" +
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
          "status.textContent=data.error;" +
          "return;" +
        "}" +

        "status.textContent=" +
          "'Werte aktualisiert: '+new Date().toLocaleTimeString();" +
        "render(data);" +
      "})" +
      ".catch(function(){" +
        "status.textContent='Abfrage fehlgeschlagen';" +
      "});" +
    "}" +

    "url.onchange=readSensor;" +
    "setInterval(readSensor,5000);" +

    "</script>"
  );

  res.send();
});


// ============================================================
// Kapitel 5: Ausgewählten Wert anzeigen
// ============================================================

HTTPServer.registerEndpoint("select", function(req, res) {
  let selectedPath = req.body || "";
  let selected = null;

  for (let i = 0; i < lastBlocks.length; i++) {
    if (lastBlocks[i].name === selectedPath) {
      selected = lastBlocks[i];
      break;
    }
  }

  if (!selected) {
    res.code = 404;
    res.headers = [["Content-Type", "text/html"]];
    res.body = page(
      "<h2>Fehler</h2>" +
      "<p>Wert nicht gefunden.</p>" +
      "<p><a href=site>Zurück</a></p>"
    );
    res.send();
    return;
  }

  let detailHtml = "";

  for (let i = 0; i < selected.details.length; i++) {
    detailHtml +=
      "<p><b>" +
      esc(selected.details[i].name) +
      ":</b> " +
      esc(selected.details[i].value) +
      "</p>";
  }

  res.headers = [["Content-Type", "text/html"]];
  res.body = page(
    "<h2>Ausgewählter Sensor</h2>" +
    "<div class=details>" +
      "<p><b>Pfad:</b> " + esc(selected.name) + "</p>" +
      "<p><b>Wert:</b> " + esc(selected.value) +
        (selected.unit ? " " + esc(selected.unit) : "") +
      "</p>" +
      detailHtml +
    "</div>" +
    "<p><a href=site>Zurück zur Auswahl</a></p>"
  );

  res.send();
});