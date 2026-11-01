# Punktlandung

Aufgaben und Belohnungen für die Familie, gemacht fürs Küchen-iPad. Die App ist eine einzige HTML-Datei ohne Abhängigkeiten.

Alle Daten bleiben lokal auf dem Gerät. In diesem Repository liegt nur die App mit erfundenen Demodaten.

**Installieren:** Die App in Safari auf dem iPad öffnen und mit „Zum Home-Bildschirm“ ablegen. Die App zeigt die Anleitung selbst an und läuft danach auch ohne Internet.

**Einrichten:** Die App startet mit Beispieldaten. Der Button „Eigene Familie einrichten“ führt durch Familienname, Mitglieder und PIN für die Verwaltung. In den Beispieldaten ist die PIN 1234.

**Daten teilen:** Unter Verwaltung → Einstellungen lässt sich der komplette Stand als JSON-Datei exportieren und auf einem anderen Gerät importieren. Der Import ersetzt alle Daten dort, auch die PIN. Die Datei enthält eure Daten und die PIN im Klartext und gehört nicht in ein öffentliches Repository.

**Grafiken ändern:** Die Dateien in `assets/` werden in `icons.js` zusammengefasst. Vor jedem Release `python3 tools/embed-assets.py` ausführen: Das baut `icons.js` neu und setzt die Version, mit der sich installierte Apps selbst aktualisieren.

**Vorlagen-Icons:** Die Vorlagen-Icons aus `tools/task-icons.txt` stammen aus der Schrift Noto Color Emoji (SIL Open Font License) und werden mit `tools/render-task-icons.js` als Bilder erzeugt, damit sie auf allen Geräten gleich aussehen.
