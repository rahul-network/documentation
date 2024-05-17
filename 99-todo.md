# Todo & Notes

## Architecture diagram

- components: microcontroller/ucon Token, ucon Anchor, Wifi-Anchor, Lorawan-Anchor, Cloud-API-server, Cloud-Database, Cloud-Dashboard-server
- interfaces: serial-AT-command-interface, API, Auth
- data-structures: serial-string formats, API data models

## Deployment diagram

- Anchor
- Cloud-DB
- Cloud-API
- Cloud-Dashboard
- deployment-nr
- VM/server cloud.sostark.nl, options to move to any container-based cloud infra (Amazon AWS, Google Cloud, Microsoft Azure, Heroku, Digital-Ocean)

## This repo workflow

- working doc: either .MD or Google.doc
- release doc: either .MD or Google.pdf

## nov-2022 list

- fix BB-upload (rename token.aux to token.sensors, check BB-inbound-connector-conversion-func)
- create API and EBD: agroup (Anchor Group) & tgroup (Token Group)
- make 'cdfunc' generic (to add more flexibly)
- implement these cdfunc's (for the Odense-project):
  - `cdf_presence_time` = Timestamps that a Token is first/last seen in some Anchor-Group-Area
  - `cdf_unique_presence` = Token presence data-stream in one Anchor-Area at a time
  - `cdf_attached_alert` = Event when multiple tokens are seen together for some time
  - `cdf_group_presence` = Token presence data-stream in a Anchor-Group-Area consolidated

<hr>
