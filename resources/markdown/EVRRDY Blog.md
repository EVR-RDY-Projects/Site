---
title: "EVR:RDY Blog"
description: "A rolling log of EVR:RDY’s evolution."
type: "Blog"
date: "Sept 2025"
icon: "⚡"
---

# EVR:RDY Blog 

---

## September 2025
**Sept 23 — SEER Sensor Hardening & Image Progress**  
Advanced the SEER base build by creating a hardened deployment image and refining the `zeek.service` integration. Each iteration makes SEER more reliable and field-ready, moving toward a production-grade sensor that can be deployed repeatably without extra overhead. This is a major step toward making SEER a tool operators can trust.  

Today I took the first two milestones of the SEER Sensor project from concept to working prototype inside a Google Cloud VM. The goal was to build a lean Ubuntu-based image with Zeek installed, hardened, and tested (**M1**), then bring online full packet capture and log rotation with <1% packet loss (**M2**).

---

## Milestone 1 — Base Image Ready

### 1. VM Setup (Google Cloud)
- Created a new GCP project (`seer-473020`).
- Enabled the **Compute Engine API**.
- Deployed a minimal **Ubuntu 24.04 LTS** VM.
- Connected via SSH through the GCP console.

### 2. Hardening the Base Image
- Increased journald retention limits to ensure logs survive reboots.
- Confirmed basic services were enabled and persistent logging was working.
- Set up a dedicated `/etc/seer/seer.env` for environment variables.

### 3. Zeek Installation
- Added the official Zeek repository.
- Installed Zeek 8.0.1 and supporting tools (`zeekctl`, `zkg`, etc.).
- Confirmed the binary was placed in `/opt/zeek/bin`.

### 4. PATH + sudo Fix
- Learned that minimal Ubuntu locks down `sudo` with a restrictive `secure_path`.
- Fixed this by adding `/opt/zeek/bin` and `/usr/sbin` to `sudo`’s secure_path so Zeek and tcpdump would run correctly as root.

### 5. Zeek Testing
- Verified Zeek version:
  ```bash
  zeek --version
  ```
- Started capture manually:
  ```bash
  sudo /opt/zeek/bin/zeek -C -i ens4
  ```
- Confirmed logs appeared in `/var/log/zeek/current/`:
  - `conn.log`
  - `dns.log`
  - `ssl.log`
  - `weird.log`

### 6. Zeek as a Service
- Built a custom `zeek.service` unit for systemd.
- Learned the difference between `${VAR}` expansion (bash) and `%%` escaping (systemd).
- Fixed by hardcoding absolute paths and setting environment variables inside the unit.
- Result: Zeek now runs as a persistent systemd service and survives reboots.

✅ **M1 Complete:** Base image hardened, Zeek service running, logs confirmed.

---

## Milestone 2 — Capture Online

### 1. Adding tcpdump for PCAP Capture
- Installed tcpdump (was missing initially).
- Discovered again that `sudo`’s `secure_path` blocked execution, fixed by editing `/etc/sudoers.d/secure-path`.
- Verified tcpdump worked manually:
  ```bash
  sudo tcpdump -i ens4 -c 100 -w /var/log/pcap/test.pcap
  ```

### 2. Building PCAP Rotation
- Created `/var/log/pcap` directory for packet captures.
- Tested tcpdump’s built-in rotation flags:
  ```bash
  sudo tcpdump -i ens4 -n -U -s 0 -B 4096 \
    -w /var/log/pcap/seer-%Y%m%d-%H%M%S.pcap \
    -G 15 -W 3
  ```
- Confirmed timestamped PCAP files were generated.

### 3. Lessons Learned with systemd
- `%` in systemd units must be escaped as `%%`.
- Hardcoding `/usr/sbin/tcpdump` failed because binary lived in `/usr/bin` on Ubuntu 24.04.
- Solved this by switching to `/usr/bin/env tcpdump` in the `ExecStart` line so PATH is respected.

### 4. Final `pcap-capture.service`
```ini
[Unit]
Description=SEER PCAP capture with rotation
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStartPre=/usr/bin/mkdir -p /var/log/pcap
Environment=PATH=/usr/bin:/usr/sbin:/bin:/sbin
ExecStart=/usr/bin/env tcpdump -i ens4 -n -U -s 0 -B 4096 \
 -G 300 -W 288 -w /var/log/pcap/seer-%%Y%%m%%d-%%H%%M%%S.pcap
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

- Rotates every 5 minutes.
- Keeps 24 hours of PCAPs (~288 files).
- Runs under systemd, restarts automatically if killed.

### 5. Pruning Excess Files
- Noticed tcpdump wasn’t deleting old timestamped files despite `-W`.
- Wrote a `pcap-prune.sh` script + systemd timer to enforce retention:
  ```bash
  ls -1t /var/log/pcap/*.pcap | tail -n +289 | xargs rm -f
  ```
- Timer runs every minute, guaranteeing no disk bloat.

### 6. Verifying Packet Loss
- Generated traffic with `curl` and `ping`.
- Restarted Zeek to dump capture stats:
  ```
  310422 packets received on interface ens4, 0 (0.00%) dropped
  ```
- Packet loss well under the 1% target (0.00% in all tests).

✅ **M2 Complete:** Zeek logs flowing, PCAPs rotating every 5 minutes, prune guard working, packet loss <1%.

---

## Key Lessons Learned

- **systemd is strict**: `%` must be escaped as `%%`. Environment expansion isn’t the same as Bash.
- **Minimal Ubuntu is lean**: root’s `secure_path` omits `/usr/sbin` and custom bins like `/opt/zeek/bin`.
- **tcpdump + systemd quirk**: `-W` doesn’t prune when using timestamped filenames; need a prune script.
- **Validation matters**: Always run the capture manually first, then wrap in systemd.

---

## Next Steps (Milestone 3)

- Add hot-swap support:
  - Attach/detach removable disk for PCAP export.
  - Auto-mount, write PCAPs when present.
  - On eject: stop capture, flush, write manifest with hashes, unmount cleanly.
- Test repeated insert/eject cycles to confirm zero data loss.

---

*End of Day Status: M1 + M2 achieved in VM. Zeek online, logs rotating, packet capture pipeline reliable. Ready to simulate hot-swap workflow for M3.*

– Burns  

---

**Sept 22 — Suricata Integration Pathfinding**  
Explored Suricata’s strengths — multi-threaded packet inspection, IDS/IPS capabilities, and OT rule integration — and mapped how it can complement Zeek within the T.A.P.S. pipeline. Documented where Suricata adds value for signature-driven context while Zeek continues as the backbone for telemetry. This creates a layered detection strategy, tailored for OT environments.  
– Burns  

---

**Sept 21 — Charter Polish & Ghost Diode White Paper**  
Strengthened EVR:RDY’s foundation by tightening the **Charter** into a crisp, one-page executive summary and drafting the **Ghost Diode white paper**. The write-up outlines a clear roadmap: start with reproducible off-the-shelf builds, then evolve into certifiable, low-cost production units. These deliverables give EVR:RDY a professional, partner-ready story while keeping the technical playbook accessible for practitioners. Also clarified the nonprofit/for-profit structure — grants and workforce development under a foundation, productization and services under TacSOC Solutions, Inc. This hybrid design sets EVR:RDY up for both impact and sustainability.  
– Burns  

---

**Sept 20 — TacSOC Hunter-Killer Team Differentiators**  
Sharpened the Hunter-Killer (HK) Team pillar: selective recruiting, AI-enabled workflows, and force-multiplier impact. Added standout elements like **culture, heraldry, and identity**, positioning HK teams as elite strike units that compress the output of a 50+ analyst SOC into a 5–10 person powerhouse. This pillar is now battle-ready and distinct — the human edge of TacSOC.  
– Burns  

---

**Sept 16 — Governance & Ghost Hardware Evolution**  
Mapped clear pathways for **active-duty compliance**: off-duty work guardrails, blind-trust/proxy models, and open-source contributions that keep EVR:RDY both compliant and moving forward. On the technical front, advanced Ghost hardware design beyond prototype: studied how to reduce costs, eliminate excess converters, and explore custom PCB options to fake link integrity (LFP) without any real return channel. This dual effort — governance + hardware R&D — strengthens both the business foundation and the technical roadmap.  
– Burns  

**Sept 16 — GHOST Diode POC progress**  
I validated the GHOST Diode POC: after a quick full-duplex baseline (static IPs, ping + ncat both ways), I built a one-way fiber link from Host B (10.0.0.2) → Host A (10.0.0.1) using three media converters and the dead-TX keepalive method—Media C (no copper) feeds C.TX → B.RX to satisfy LFP while the actual data path is B.TX → A.RX only, with no reverse fiber connected. Streaming UDP from B showed up in Wireshark on A, while ping/TCP from A→B failed exactly as designed, confirming hardware-enforced unidirectionality. This successfully proves the diode concept with commodity gear and provides a repeatable setup for future hardening and throughput testing.
– Burns

---

**Sept 15 — Finished the OT Agent White Paper**  
I wrapped the OT Agent white paper. It lays out lightweight, low-impact agents built for fragile OT networks that can normalize telemetry and feed SEER or flow straight into Chronicle/SIEM without risking process stability. This pairs with the diode work so operators can get visibility without violating one-way constraints. Felt good to publish something practical that ops teams can actually deploy.  
– Burns

---

**Sept 15 — Drafting `diode-whitepaper.md`**  
I also began a brand-free Ghost Diode white paper focused on the strategy: start with a reproducible, off-the-shelf PoC (media converters + fiber) and iterate toward a certifiable, low-cost production unit. I want the doc to read like a build + certify plan, not marketing.  
– Burns

---

**Sept 14 — Site Development & Branding Kickoff**  
I stood up the EVR:RDY site as a fast one-pager on GitHub Pages: hero section, clear call-to-action, and project tiles for Ghost, SEER, and TacSOC. I pinned a fixed parallax backdrop to keep it lightweight (no heavy JS) and locked in the palette (bone-white, OD/tactical green, ink-black). I also added the Sinatra line — “we can do anything with nothing” — because that’s exactly the energy here.  
– Burns

---

**Sept 14 — Post-Diode Pipeline Design (T.A.P.S. “last mile”)**  
A diode isn’t the finish line — it’s the gate. I mapped the “after” path: normalize and enrich, produce JSON, ship to Chronicle, and keep PCAP/image access for analysts on the safe side. This becomes the last stage of T.A.P.S. and the bridge from Ghost to SEER → TacSOC.  
– Burns

---

**Sept 14 — Blueprint Update: RAID Method & OT Focus**  
I updated the EVR:RDY blueprint to cement our OT stance: slash SIEM cost with Chronicle, one-way telemetry out of OT, and HK teams that clone as they mature. I formalized our RAID operating method for precision hunting and response, aligning to NIST ICS and MITRE ATT&CK for ICS so nothing is hand-wavey.  
– Burns

---

**Sept 13 — Repo Hardening & Open Hardware License**  
I added CONTRIBUTING and SECURITY docs and switched the hardware work to **CERN-OHL-S** so the “open” story is clean and enforceable. I re-ordered SEER’s roadmap so hardware setup precedes any software tests — stay honest to how field work actually starts.  
– Burns

---

**Sept 13 — Ghost PoC Kit (Ordered & Consolidated)**  
I documented the first Ghost kit so anyone can reproduce: three TP-Link media converters, a compact unmanaged switch, and fiber jumpers. This is the bones-only PoC — the point is to prove unidirectional flow cheaply, then iterate.  
– Burns

---

**Sept 13 — SEER Naming & Scope Lock**  
I settled on **SEER — Scalable Endpoint & Environmental Reconnaissance**. SEER’s initial scope: SPAN/TAP capture → Zeek-style logs → optional PCAP buffering → endpoint JSON ingest when needed. Keep it lean, visible, and deployable in plants that hate change.  
– Burns

---

**Sept 11 — Recruiting & “Everyone Eats” Pay Model**  
Mapped the people side: senior-anchored Hunter-Killer teams with transparent bands, above-market base, and on-the-job mentorship to promote Tier-2s into Tier-3s. Grants cover SMEs; students learn under real pressure with guardrails. This is how we scale skills without burning people out.  
– Burns

---

**Sept 10 — Org Structure: Foundation + TacSOC Solutions, Inc.**  
I locked the hybrid model. The **EVR:RDY Foundation** (non-profit) handles workforce development, research, and grants; **TacSOC Solutions, Inc.** (for-profit) delivers the ops and productizes Ghost/SEER/TacSOC. By today, the domain was in hand and the site plan solid.  
– Burns

---

## August 2025

**Aug 25 — Ghost Diode Architecture Jam**  
Sketched variants: Protectli-style boxes with Intel NICs, fiber SFPs, and hot-swap storage vs. ultra-minimal media-converter builds. Decision: start embarrassingly simple so field techs can rebuild one from a truck roll — save the custom board until the doctrine and test data warrant it.  
– Burns

---

**Aug 23 — All-In on OT**  
I parked the non-cyber side projects and refocused entirely on Ghost, SEER, and TacSOC. From this point, everything I write, buy, or build pushes the OT mission forward.  
– Burns

---

**Aug 4 — Business Plan v1 Finalized (OT/vCISO)**  
I finalized the first business plan draft: veteran-led, fractional CISO for SMBs and critical infrastructure with a clear OT/ICS thread and price-realism that smaller operators can actually afford. This anchors the “CISO-level expertise without the full-time cost” message that leads naturally into our OT offerings.  
– Burns

---

**Aug 3 — EVR:RDY Blueprint v0.1 (Three Problems, One Approach)**  
I authored the first blueprint for a low-cost, scalable OT defense company: lower SIEM costs with Chronicle, move telemetry one-way out of OT, and scale with AI-assisted HK teams using the **RAID** method. This is the DNA for TacSOC over SEER over Ghost — one chain.  
– Burns

---

**Aug 3 — Marketing Strategy & Branded Docs (OT-flavored vCISO)**  
I created a lean marketing plan and branded templates tuned for industrial SMBs, defense contractors (CMMC), and clinics needing practical security — not hype. The site will educate first, sell second, and make our OT/ICS niche obvious from the first scroll.  
– Burns

