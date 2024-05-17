<!-- # 12-deployment.md -->

# Deployment

## Cloud-server (cloud.sostark.nl)

### Physical server

Photo of physical server in rack of provider Zappa-Internet in NIKHEF datacenter Amsterdam:

<img src="img/d210731-Zappa-Internet--NIKHEF-kast--IMG_6810-zoom--server.jpg" alt="Zappa-Server" width="600"/>

### Virtual Machine

<img src="img/d210731-Zappa-Internet--overview-VMs.png" alt="zap-srv-vms" width="400"/>
          
<img src="img/d210731-Zappa-Internet--VM-cloud.sostark.nl--overview.png" alt="cloud-vm-overview" width="600"/>

<img src="img/d210731-Zappa-Internet--VM-cloud.sostark.nl--CPUs.png" alt="cloud-vm-cpu" width="600"/>

<img src="img/d210731-Zappa-Internet--VM-cloud.sostark.nl--Memory.png" alt="cloud-vm-memory" width="600"/>

### IP addresses

- cloud.i.sostark.nl = `10.212.21.1` (openvpn-gwserver)
- cloud.sostark.nl = `193.38.153.12` (zappa-isp-internal: `100.91.11.212`)

## Deployment Design

### Deployment following DTAP

The Deployment Design follows the [DTAP](https://en.wikipedia.org/wiki/Development,_testing,_acceptance_and_production) "Phased Environments" approach.

Note: that these environments typically run in parallel !

| Phase Letter | Phase Name             | Description                                                                                                                                                 |
| ------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `D`          | Development (-testing) | The software runs for testing of code, typically with console-logging enabled, and frequent reloads                                                         |
| `T`          | Testing (integration-) | The software runs for testing of overall functionallity and integration of other parts (client-server, etc.), and is only reloaded after upgrade from env:D |
| `A`          | Acceptance (-testing ) | The software runs for "Acceptance Testing", meaning running (automated) Unit-tests and/or Integration-tests against documented (coded) criteria.            |
| `P`          | Production             | The software is done with (acceptance) testing, and runs in production (meaning customers and/or partners are using this application instance)              |

### Deployment Number Design

The deployment-number is used as a Minor number part in TCP-port numbers.

| Deployment number | Deployment Name      | Description                                              |
| ----------------- | -------------------- | -------------------------------------------------------- |
| `51`              | Cloud-51/Engineering | API-v1 and Dashboard-v1 for Engineering                  |
| `52`              | Cloud-52/Engineering | API-v2.1 and Dashboard-v2.1 for Engineering              |
| `57`              | Cloud-57/WTC-ND      | API-v2.0 and Dashboard-v2.0 for Testing:Sonicbolt/WTC-ND |

### App Number Design

The App-number is used as a Major number part in TCP-port numbers.

| App number | App Name           | Description                                                            |
| ---------- | ------------------ | ---------------------------------------------------------------------- |
| `80`       | node/express       | API-server (for Testing or Production, but not Development)            |
| `81`       | node/mongo-express | Mongo-Express (view/change the MongoDB directly, independently of API) |
| `82`       | node/web/react     | Dashboard                                                              |
| `270`      | mongodb            | MongoDB-server                                                         |

## Jump-page for current Deployments

### Cloud-51

Also called: <span class="mono">TokenMe APV-v1 + "old-v1" Dashboard-v1</span>

- Dashboard: https://cloud.sostark.nl/code/63995848/dashboard/
- Dashboard (private, VPN-internal): http://cloud.i.sostark.nl:3300/
- mongodb (Docker Container): tcp/27051
- mongo-express (Docker Container): http://cloud.i.sostark.nl:8151/

### Cloud-52

Also called: <span class="mono">TokenMe APV-v2 + "Engineering" Dashboard-v2</span>

- Dashboard: https://cloud52.sostark.nl/code/75114096/dashboard/
- Dashboard (private, VPN-internal): http://cloud.i.sostark.nl:8252/
- API (private, VPN-internal): http://cloud.i.sostark.nl:8052/
- Chat test for Socket.io: http://cloud.i.sostark.nl:8052/api/public/test_1e52/chat.html
- mongodb (Docker Container): tcp/27052
- mongo-express (Docker Container): http://cloud.i.sostark.nl:8152/

### Cloud-57

Also called: <span class="mono">Sonicbold/WTC-ND-Test APV-v2 + Dashboard-v2</span>

- Dashboard: https://cloud.sostark.nl/wtc-nd-test/code/39068592/
- WebUI (private, apiserver) http://cloud.i.sostark.nl:8017/
- WebUI (private, webui) http://cloud.i.sostark.nl:8082/
- mongodb (Docker Container): tcp/27057
- mongo-express (Docker Container): http://cloud.i.sostark.nl:8157/

### Github repositories

- <span class="mono">code repo</span> the original "main" repo SUM4: https://github.com/Sostark/SUM4 <br> this code has been copied-to and split-in new repos:
  - TokenMe-API-Server
  - TokenMe-Dashboard-Server
  - TokenMe-Wifi-Anchor
- <span class="mono">code repo</span> TokenMe-API-Server: https://github.com/Sostark/TokenMe-API-Server
- <span class="mono">code repo</span> TokenMe-Dashboard-Server: https://github.com/Sostark/TokenMe-Dashboard-Server
- <span class="mono">code repo</span> TokenMe-Wifi-Anchor: https://github.com/Sostark/TokenMe-Wifi-Anchor
- <span class="mono">doc repo</span> TokenMe-API: https://github.com/Sostark/TokenMe-API <br> and doc-page: https://sostark.github.io/TokenMe-API/
- <span class="mono">doc repo</span> TokenMe-Architecture: https://github.com/Sostark/TokenMe-Architecture

### Webhook (arch-doc hosting)

- Webhook: https://cloud.sostark.nl/code/29117732/doc/webhook.handle
- Webhook (vpn-internal): http://cloud.i.sostark.nl:9922

## Manual on SSH login

- In order to login to the Cloud-server or an (Linux-based) Anchor, you need SSH access, and in some cases also OpenVPN access.
- There is an OpenVPN server running on the Cloud.server that has 2 networks:
  - 10.212.22.x for (Windows/Mac) clients
  - 10.212.21.x for (Linux-based) Anchors, and other always-on gateways (like in the office of JDG)
- If you need only SSH access, you don't need an OpenVPN connection, as you can use the Cloud-server as a <span class="mono">'Jump-host'</span> (login to server-1, and from server-1 you login to server-2)
- On Mac and Linux systems, the SSH client can be used on the console or CLI (Command Line Interface), but on Windows the CLI (Command Prompt, in this case) does not have a SSH client, so you need to install one.
- on Windows you can download and install Putty SSH-client <br> download: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
- Below a brief screenshot-based manual on how to use SSH on Windows:
- Download Putty <br> <img src="img/win-putty-download.png" width="800"/>
- Install Putty <br> <img src="img/win-putty-install.png" width="800"/>
- Start Putty <br> <img src="img/win-putty-start.png" width="800"/>
- Start (and save) a session (remember to change the port number, if required) <br> <img src="img/win-putty-session.png" width="800"/>

## Manual on Serial Anchor testing

- login as user 'tokenme' <br> (pwd same as WiFi:Sostark_Mobile) <br> `ssh tokenme@hostname-anchor.sosstark.nl`
- go to folder <br> `cd prod/TokenMe-Wifi-Anchor/ucon-mgr/`
- stop daemon 'serial_anchor.py' (called via init-script: 'etc/init.d/serial_anchor') <br> `./stop.sh`
- start minicom (linux replacement of terraterm) <br> `./minicom-115200-dev-ttyS0.sh`
- run daemon 'serial_anchor.py' directly (instead via init-script) (to see stdout) <br> `./run.sh`
- start daemon 'serial_anchor.py' (called via init-script: 'etc/init.d/serial_anchor') <br> `./start.sh`
- dump and follow the text lines in file 'serial-dump.txt' <br> `./tail-f-serial-dump.sh`

## Manual on Anchor Shutdown

- login as user 'tokenme' on an Anchor <br> (pwd same as WiFi:Sostark_Mobile) <br> (need VPN access, <span class="mono">sum4-anchor-1</span> has VPN-IP <span class="mono">10.212.100.81</span>) <br> `ssh tokenme@10.212.100.81`
- Use this command to reboot <br> `sudo reboot`
- Use this command to halt / shutdown <br> `sudo halt`

<hr>
