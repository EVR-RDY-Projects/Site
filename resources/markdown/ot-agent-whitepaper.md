---
title: "Slow-and-Low Host Agent for OT/ICS"
description: "A pseudo-agent design—native scripts vs. packaged executable—for safely exporting host data from legacy and modern Windows in industrial environments"
type: "Technical Whitepaper"
date: "Sep 2025"
icon: "🛡️"
---

# Slow-and-Low Host Agent for OT/ICS

## Executive Summary

OT/ICS hosts need continuous visibility for detection and incident response, yet they cannot tolerate heavyweight agents, kernel hooks, or chatty network traffic—especially on legacy systems. This paper specifies a **slow-and-low pseudo-agent** that gathers **small, high-value artifacts** (event logs and state deltas) and **trickles** them off-host as compact JSON using **native Windows capabilities** (XP → Windows 11). Heavy parsing, correlation, and storage occur **off-host** at an in-plant collector that forwards data outward via a **controlled, unidirectional path**.

Two realizations are provided:

- **Option A — Native approach (scripts only):** Batch + WSH/JScript using built-in tools (`wevtutil`/`eventquery.vbs`, `tasklist`, `sc`, `schtasks`, `netstat`, `ipconfig`, `route`, optional `makecab`) and **low-stress transport** (e.g., BITS).
- **Option B — Packaged executable:** A single, statically linked binary (C/C++ or Rust), invoked by Task Scheduler (no service/driver), using Windows APIs directly for robust, faster collection and built-in throttling/crypto.

Both follow the same operating principle: **one tiny job per wake**, caps, CPU/jitter gates, and background transfer to keep host and network load negligible.

---

## The Challenge

Traditional host agents and EDR platforms can violate change control, add instability, or be unsupported on OT systems. Environments often include **aging OS versions**, require **strict segmentation**, and forbid **persistent services or drivers**.

### Key Problems Addressed

- **Operational Fragility** — HMIs/engineering workstations are safety-relevant and intolerant of resource spikes.
- **Legacy Diversity** — Mixed Windows vintages (XP/2003 → 11) with differing telemetry interfaces.
- **Change-Control Constraints** — Installing drivers/services or large agents may be disallowed.
- **Segmentation/Egress Limits** — OT→IT data movement must be controlled and ideally unidirectional.
- **Licensing/Legal** — Preference for built-in, redistribution-safe components.

---

## Solution Overview: “Slow-and-Low” Pseudo-Agent

A minimal, **scheduled** host collector that **wakes every 2–3 minutes**, performs **one** lightweight capture, writes a small **NDJSON** file (optionally compressed), and **trickles** it to an **in-plant collector** using **low-priority, low-bandwidth transport** (e.g., BITS). It maintains simple **bookmarks/snapshots** so each payload is incremental (deltas only).

### Design Goals

1. **Ultra-low footprint** — Seconds of runtime per tick; strict size/record caps.
2. **No services/drivers** — Easy to approve/remove; minimal change impact.
3. **Legacy-aware** — Works from **Windows XP/2003** through Windows 11.
4. **Signal-dense, size-light** — Prioritize **event logs** plus **diff-only** system state.
5. **Trickle egress** — Use native background transport and jitter to avoid bursts.
6. **Off-host heavy lifting** — Parsing, correlation, enrichment at the collector.

---

## Data Model (What Is Collected)

### Event Logs

- **Vista+ (EVTX):** `wevtutil qe <channel> /c:<N> /rd:true /f:xml` with **bookmark** deltas.  
  Emit compact JSON per event: `ch,id,ts,pc,prov,lvl,sid` plus selected `EventData` pairs (short keys, size-capped).
- **XP/2003 (EVT):** `eventquery.vbs /l <channel> /v /fo table`.  
  Cap records per tick; heuristic reducer maps table columns to compact keys (`id, ts, pc, src, lvl, u, …`). If parsing is risky, send capped raw text for off-host parsing.

**Default channels and weights (adjustable):**
- Security (2× frequency), System (1×), Application (1×). Optional: TaskScheduler/Operational, Defender, custom vendor logs (Vista+).

### State Diffs (Delta-Only)

- **Processes:** `tasklist /fo CSV` → normalize → diff vs. last snapshot.
- **Services:** `sc query state= all` (optionally `driverquery`) → diff.
- **Scheduled Tasks:** `schtasks /query /fo CSV /v` → diff.
- **Network:** `ipconfig /all` + `netstat -ano` + `route print` → consolidated → diff.

Outputs are **NDJSON**; each line is one event or a small diff record.

---

## Architecture

### Host-Side Flow (per tick)

1. **OS discovery** → choose EVTX (Vista+) vs. EVT (XP), choose transport.  
2. **Resource probe** → CPU/memory checks; may skip or shrink capture.  
3. **Run one job** → logs or a state-diff job per round-robin.  
4. **Write NDJSON** → optional compression (CAB/Deflate).  
5. **Low-stress transfer** → BITS background job (or SMB drop/robocopy `/IPG`).  
6. **Update state** → bookmarks/snapshots; jitter before exit.

### In-Plant Collector

Receives trickled files per host, validates integrity (hashes), normalizes, enriches, and forwards via a **unidirectional path** to IT/SIEM storage and analytics.

### Topology (example)
[OT Hosts] --(SMB/BITS trickle)--> [In-Plant Collector] --(unidirectional)--> [IT/SIEM]
HMI Legacy-safe Staging, parse Storage & hunt


---

## Transport (Low-Stress, Native)

- **BITS** (XP SP2+): background, retry/backoff, bandwidth-friendly; to SMB/HTTP(S).
- **SMB drop only**: write to a collector share; collector sweeps/pulls (no active copy load).
- **Robocopy /IPG** (if available): rate-shaped copies on systems with Robocopy.
- **Maintenance-window moves**: for sites forbidding continuous trickle.

**Recommended:** BITS where present; keep file sizes small (<100 KB typical) to minimize job durations.

---

## Scheduling, Pacing, and Flow Control

- **Cadence:** Every 2–3 minutes (tunable).
- **Caps:** EVTX `/c:200–500` newest; EVT capped lines; diffs emit only changes.
- **CPU gate:** Skip tick if CPU > threshold (e.g., 75%).
- **Jitter:** Random +0–45s to desynchronize hosts.
- **Backoff:** If the outbox grows or transfer fails, auto-reduce caps and extend cadence until queues drain.

---

## OS Discovery & Automatic Resource Management

**Discovery:**
- Probe OS version and features via registry (`HKLM\...\CurrentVersion`), `ver`, file existence:
  - `wevtutil` → EVTX path; else `eventquery.vbs` → EVT path.
  - `bitsadmin`/BITS COM present? `robocopy` present?
- Save a per-host **capability profile**.

**Adaptive throttling (each tick):**
- **CPU/Mem checks:** If high, **skip** or **halve** `/c:` for this tick.
- **Dynamic caps:** If last 3 files <50 KB, gently increase `/c:`; if any >80 KB or CPU gate tripped, decrease `/c:` and add jitter.
- **Disk guardrails:** If free space low or queue large, pause compression and shrink captures.
- **Transport health:** On repeated transfer failures, switch to SMB drop and lengthen cadence until stable.

---

## Option A — Native Pseudo-Agent (Scripts Only)

**Implementation**
- Batch + WSH/JScript; built-in tools only:
  - Logs: `wevtutil` (Vista+)/`eventquery.vbs` (XP/2003)
  - State: `tasklist`, `sc`, `schtasks`, `netstat`, `ipconfig`, `route`
  - Compression: `makecab` (optional)
  - Transport: **BITS** (preferred), SMB drop, or Robocopy `/IPG`
- Scheduled Task wakes every 2–3 minutes; **one job per wake**; JSONL output.

**Pros**
- Max **compatibility** (XP→Win11); no compilers or extra runtimes.
- **Change-control friendly**: no services/drivers; easy to remove.
- Transparent and auditable (plain text scripts).

**Cons**
- Shell parsing can be **brittle** across locales/OS flavors.
- Less robust error handling/metrics; limited on-host crypto.
- Slightly higher CPU time for text handling vs. API-level.

---

## Option B — Packaged Executable (Single Binary)

**Implementation**
- One statically linked **EXE** (C/C++ or Rust); still run by Task Scheduler (no service).
- Use Windows APIs:
  - EVTX: `EvtQuery/EvtNext/EvtRender` + bookmarks; EVT: `ReadEventLog`.
  - Processes/Services/Tasks: Toolhelp/SCM/WMI; Network: IP Helper + TCP/UDP tables.
- Built-in components: NDJSON encoder, compression (LZ4/Deflate), integrity (HMAC/AEAD), robust spool, BITS COM integration, adaptive scheduler.

**Pros**
- **Sturdier & faster** than shell parsing; fewer locale quirks.
- Rich **error handling**, telemetry, self-logs; strong crypto/signing possible.
- Easier to add allowlists, advanced filters, and smarter throttling.

**Cons**
- Requires **build/signing/distribution** across OS/arch variants.
- Larger artifact; careful dependency handling for XP/2003 support.
- Changes require **re-release**; less hotfixable than scripts.

---

## Compare & Contrast

| Aspect | Native Scripts | Packaged Executable |
|---|---|---|
| OS Coverage | Excellent (XP→11) | Excellent with careful builds |
| Install Footprint | Folder + Scheduled Task | Single EXE + Scheduled Task |
| Runtime Stability | Good (text parsing) | Best (API-level) |
| Performance | Good | Better (lower CPU per record) |
| Security Features | Basic hashing/HMAC | Strong crypto, signed binary |
| Observability | Minimal logs | Rich metrics & logs |
| Change Control | Very friendly | Friendly; signing preferred |
| Dev Effort | Low/Medium | Higher upfront, lower opex later |
| Hotfix Speed | Immediate (edit script) | Requires rebuild/redeploy |

---

## Performance Envelope (Targets, DEEP profile)

- **Per tick file size:** Logs 10–60 KB; diffs 5–20 KB (pre-compression).  
- **Daily per host:** ~10–50 MB (pre), **~5–30 MB** (post-compression).  
- **CPU/IO:** A few seconds per tick; CPU 2–5% transient; I/O capped by `/c:`.  
- **Medium site (~200 hosts):** **~1–3 GB/day** total after compression, evenly trickled.

*(All tunable via cadence, caps, channel selection.)*

---

## Security & Compliance

- **No persistent services/drivers**, no listening sockets; Scheduled Task only.
- **Least privilege:** Prefer SYSTEM for completeness; otherwise constrained account with needed channel/read and share/write.
- **Integrity:** Per-file hashes; optional HMAC/AEAD sidecar; collector re-hash with ledger.
- **Auditability:** File-based operations; configuration and state are human-readable.
- **Standards alignment:** Supports principles in **IEC 62443** (segmentation/monitoring/least privilege) and complements evidence needs (e.g., **NERC CIP**) with host event timelines and state change histories.

---

## Deployment Guide

### Pre-Deployment

1. **Inventory OS & policies** (XP/2003 → 11; allowed protocols; share paths).
2. **Define targets** (channels, caps, cadence, jitter, CPU gate).
3. **Plan collector** (ingest paths, hashing, unidirectional relay).

### Installation

- **Native Scripts:** Copy folder (e.g., `C:\ot_agent\`), set config (destination, caps), create Scheduled Task (2–3 min).  
- **Executable:** Drop EXE + small config (INI/JSON), create Scheduled Task.

### Validation

1. **Connectivity:** Files appear on collector per host; hashes logged.
2. **Performance:** Measure tick duration/CPU; tune `/c:` and cadence.
3. **Burst handling:** Simulate event spikes; verify caps/backoff maintain small files.
4. **Egress path:** Confirm unidirectional relay; integrity preserved end-to-end.
5. **IR drills:** Create benign persistence/logon anomalies; confirm visibility.

### Maintenance

- Rotate logs/state; monitor queue sizes and transfer retries.
- For EXE builds, maintain signing keys and reproducible builds.

---

## Benefits & ROI

- **Operational safety:** Minimal system impact; easy rollback.
- **Visibility uplift:** Host timelines, authentications, service/task changes, process/network diffs.
- **Scalable cost profile:** Built-in tooling; modest storage/egress.
- **Compliance support:** Continuous evidence without invasive agents.

---

## Roadmap (Optional Enhancements)

- **Event ID allowlists/denylists** per role (HMI, historian, eng workstation).  
- **Role-aware defaults** (caps/cadence by host class).  
- **Extended channels** (Sysmon/Defender/TaskScheduler Operational on newer OS).  
- **Integrity envelopes** (per-file HMAC/AEAD).  
- **Self-update** at next tick via staged file swap (no service restarts).

---

## Conclusion

A **slow-and-low pseudo-agent**—delivered either as **pure native scripts** or a **packaged executable**—provides continuous, actionable host telemetry across XP→Windows 11 with negligible risk to sensitive OT workloads. By prioritizing event logs, sending diff-only state, and trickling via native background transports, operators gain the signal required for detection and forensics while respecting the constraints of industrial environments.

---

## Clarifying Question (to finalize defaults)

**Which OS versions are in scope (e.g., XP SP3, Server 2003, 7, 10 LTSC, 11), and which egress methods are permitted on hosts (SMB to an in-plant share, HTTP/HTTPS, SMB-only)?**  
Your answer lets us lock the transport matrix and default caps per OS.

---

**Document Version:** 1.0  
**Last Updated:** September 2025  
**Classification:** Public Technical Specification
