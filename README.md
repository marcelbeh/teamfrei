# TeamFrei

Schlanker Desktop-Abwesenheitsplaner für fünf Kolleginnen und Kollegen.

## Stand

Desktop-Monatskalender, Doppelmonatsansicht, vier Urlaubsstatus, NRW-Feiertage, konfigurierbare Schulferien, Profilwahl ohne sichtbaren Login, Konfliktampel, einfache Fairness-Tabelle und Änderungsprotokoll im gespeicherten Dokument. Frankie ist noch ein Emoji-Platzhalter. Ohne Konfiguration arbeitet die App ausschließlich im lokalen Browser.

## Supabase Cloud einrichten

1. Neues Supabase-Projekt anlegen. **Anonymous Sign-ins** unter Authentication aktivieren.
2. SQL aus `supabase/migrations/001_teamfrei.sql` im SQL Editor ausführen.
3. Mit dem SQL-Beispiel am Ende der Migration einen Raum und einen **privaten, ausreichend langen Zugangscode** erstellen. Die zurückgegebene UUID notieren.
4. In Supabase unter Database > Publications die Tabelle `public.teamfrei_state` für `supabase_realtime` aktivieren (falls noch nicht aktiviert).
5. `config.example.js` als `config.js` kopieren und Projekt-URL, Publishable/anon-Key und Raum-UUID eintragen. Den Zugangscode **niemals** dort eintragen.
6. Die Anwendung über HTTPS hosten. Beim ersten Aufruf pro Browser wird der Raumcode abgefragt, danach läuft eine unsichtbare anonyme Auth-Sitzung. Profile bleiben frei wählbar.

## Einschränkungen / vor Einsatz beachten

- **Nicht produktionsreif**: Noch keine automatisierten Tests oder Browser-End-to-End-Prüfung.
- Cloud speichert aktuell ein gemeinsames JSON-Dokument. Bei **gleichzeitigen Änderungen** kann die letzte Speicherung eine vorherige überschreiben. Für produktiven Einsatz auf zeilenbasierte Einträge mit Versionsprüfung umstellen.
- Der Zugangscode regelt die Raum-Mitgliedschaft, nicht die Identität der ausgewählten Person. Jeder Raumteilnehmer kann jedes Profil wählen. Das ist bewusst die gewünschte Bedienung, aber keine technische Berechtigungstrennung.
- Ferien NRW müssen aktuell manuell in Einstellungen gepflegt werden; die App behauptet keine automatische amtliche Datenaktualisierung.
- Die Fairness-Statistik zählt einfache Brückentage und Ferien-Urlaubstage, aber keine vollständigen Kurzwochen-/Mehrjahres-Auszeichnungen. Der Jahreschart und die finale 3D-Figur Frankie sind noch nicht implementiert.
- Statusänderungen werden im Dokument mit gewähltem Profil und Zeitstempel protokolliert; dies ist kein manipulationssicherer Audit-Trail.
- Bei dienstlicher Nutzung vorher die Cloud-Freigabe und Datenschutzanforderungen der Hochschule klären.

Keine SAP-Schnittstelle, keine Genehmigung durch TeamFrei.
