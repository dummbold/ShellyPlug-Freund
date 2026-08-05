// Mini-Webserver + HTTP-GET-Test für Shelly Plus Plug S MTR
// Aufruf: http://192.168.202.13/script/1/site

function esc(s) {
  s = "" + (s || "");
  return s.split("&").join("&amp;").split("<").join("&lt;")
    .split(">").join("&gt;").split("\"").join("&quot;");
}

function html(content) {
  return "<!doctype html><meta charset=utf-8>" +
    "<title>Shelly HTTP-Test</title>" +
    "<h2>Shelly HTTP-Test</h2>" + content;
}

// POST /script/1/fetch
HTTPServer.registerEndpoint("fetch", function (req, res) {
  let url = req.body || "";

  // Formular wird als text/plain übertragen: url=http://...
  if (url.indexOf("url=") === 0) url = url.slice(4);

  let end = url.indexOf("\n");
  if (end >= 0) url = url.slice(0, end);
  if (url.charAt(url.length - 1) === "\r") url = url.slice(0, -1);

  if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
    res.code = 400;
    res.headers = [["Content-Type", "text/html"]];
    res.body = html("<p>Ungültige URL.</p><a href=site>Zurück</a>");
    res.send();
    return;
  }

  Shelly.call("HTTP.GET", {url: url, timeout: 8},
    function (result, errorCode, errorMessage) {
      res.headers = [["Content-Type", "text/html"]];

      if (errorCode !== 0) {
        res.code = 502;
        res.body = html(
          "<b>Fehler " + esc(errorCode) + ":</b> " +
          esc(errorMessage) + "<p><a href=site>Zurück</a>"
        );
        res.send();
        return;
      }

      let body = result.body || "";
      let description = result.message || "";

      // Wenn die API eine JSON-Eigenschaft "description" liefert, diese nutzen.
      try {
        let json = JSON.parse(body);
        if (typeof json.description === "string") {
          description = json.description;
        }
      } catch (e) {}

      if (body.length > 6000) body = body.slice(0, 6000) + "\n[gekürzt]";

      res.code = 200;
      res.body = html(
        "<p><b>URL:</b> " + esc(url) + "</p>" +
        "<p><b>Status:</b> " + esc(result.code) +
        " – " + esc(description) + "</p>" +
        "<pre>" + esc(body) + "</pre>" +
        "<p><a href=site>Neue Anfrage</a></p>"
      );
      res.send();
    }
  );
});

// GET /script/1/site
HTTPServer.registerEndpoint("site", function (req, res) {
  res.headers = [["Content-Type", "text/html"]];
  res.body = html(
    "<form method=post action=fetch enctype=text/plain>" +
    "<input name=url size=55 placeholder='http://192.168.202.13/rpc/Shelly.GetStatus'>" +
    "<button>Abfragen</button></form>"
  );
  res.send();
});