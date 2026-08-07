Verbleibende relevante Techniken aus 

[GitHub - towiat/spotelly: Price-based Operation of Shelly Devices · GitHub](https://github.com/towiat/spotelly)



1. HTML beim Build komprimieren und in JavaScript einbetten
   text

Kopieren
HTML-Seiten
→ minifizieren
→ gzip-komprimieren
→ Base64-kodieren
→ in Script 3 einbetten
Script 3 liefert die Ansichtsseite aus. Die einzelnen Bereiche beziehungsweise HTML-Seiten werden dort über Buttons geöffnet oder ein-/ausgeblendet.

2. JSON-Konfiguration im KVS
   Konfigurationsdaten werden als JSON strukturiert und dauerhaft im KVS gespeichert.

Beispiel:

javascript

Kopieren
KVS.Set({
  key: "scene.1",
  value: JSON.stringify(scene)
});
Mögliche Daten:

text

Kopieren
LED0 bis LED9
Szenen
Sensor-URLs
JSON-Pfade
Thresholds
Hystereseparameter
Schaltzustände
3. Shelly-Schedule für zeitabhängige Abläufe
Spotelly verwendet:

javascript

Kopieren
Schedule.Create
Schedule.Update
Damit können zeitgesteuerte Script-Aufrufe realisiert werden, beispielsweise:

text

Kopieren
regelmäßige Sensorabfrage
Einschaltverzögerung
Ausschaltverzögerung
Mindestlaufzeit
Mindestpause
Nachtzeiten
4. Speicherfreigabe bei HTTP-Antworten
Nach der Auswertung einer externen HTTP-Antwort gibt Spotelly nicht mehr benötigte Daten frei:

javascript

Kopieren
delete res.headers;
delete res.body;
Das ist bei größeren JSON-Antworten für die RAM-Nutzung des Shelly relevant.

5. Fehlerprüfung bei externen HTTP-Abfragen
   Spotelly unterscheidet zwischen:

text

Kopieren
Shelly-RPC-Fehler
HTTP-Fehlercode
ungültiger Antwort
ungültigem JSON
Übertragen auf unseren Sensorzugriff:

text

Kopieren
HTTP.GET
→ RPC-Fehler prüfen
→ HTTP-Status prüfen
→ JSON parsen
→ Wert extrahieren
→ Sensorstatus aktualisieren