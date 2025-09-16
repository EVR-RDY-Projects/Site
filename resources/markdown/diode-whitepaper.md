---
title: "Hardware-Enforced Data Diodes for Critical Infrastructure Security"
description: "A strategic approach to developing affordable, certifiable unidirectional gateways, including an off-the-shelf proof-of-concept design"
type: "White Paper"
date: "September 2025"
icon: "🔒"
---

# Hardware-Enforced Data Diodes for Critical Infrastructure Security

## Executive Summary

Operational Technology (OT) environments demand the highest levels of reliability and protection. Traditional cyber defense mechanisms — firewalls, intrusion detection systems, and monitoring platforms — are often software-based and inherently vulnerable to misconfiguration or exploitation.

A hardware-enforced data diode provides an uncompromising guarantee: information can only move in one direction. This unidirectional flow prevents adversaries from reaching back into critical control networks, while still allowing monitoring, forensics, and visibility.

This paper outlines a practical, staged strategy to design, validate, and eventually certify a **low-cost hardware data diode**, starting with an **off-the-shelf proof-of-concept (POC)** and progressing to optimized production hardware and formal certification. The end state is a certifiable device priced to be accessible to small utilities and under-resourced critical infrastructure operators.

---

## The Concept

A **data diode** enforces one-way communication — from a **source (high-security)** network to a **destination (lower-security/monitoring)** network — using hardware, not software. By physically preventing the return path, a diode ensures that no control, command, or covert channel can traverse back into protected environments.

Key properties:

- **Unidirectionality enforced in hardware** (e.g., optical transmit only).
- **Protocol agnosticism** at Layer 1/2; higher layers may require adaptation to accommodate one-way transport.
- **Integration flexibility** for telemetry (e.g., logs, sensor outputs, flow records) to external analysis platforms.

---

## Strategic Approach

The development plan focuses on **affordability, deployability, and certifiability**:

1. **Proof of Concept (COTS)**
   - Assemble a working diode using commercially available media converters, fiber, and a basic switch.
   - Demonstrate unidirectional behavior and document test evidence (captures, wiring photos, procedures).
   - Identify operational pitfalls (autonegotiation, link fault pass-through, backchannel risks).

2. **Optimization & Cost Reduction**
   - Move from multiple COTS boxes to a **single custom PCB** with integrated optical TX and receive-path omission.
   - Eliminate management backplanes that could expose configuration channels.
   - Add **health monitoring** (heartbeat, frame counters) and **store-and-forward buffering** to improve reliability of one-way telemetry.

3. **Industrialization & Certification**
   - Engineer for standards (mechanical, EMC, safety) and environments typical of OT (temperature, vibration, noise).
   - Pursue security and safety **certifications** (e.g., IEC 62443-4-1/-4-2 alignment; Common Criteria protection profiles where applicable; sector requirements such as NERC CIP alignment).
   - Maintain **verification harnesses** (repeatable test jigs, automated optical tests, packet capture regressions) to provide objective evidence of one-way enforcement.

---

## Current Off-the-Shelf Proof-of-Concept (POC) Design

### Objectives

- Demonstrate **true one-way physical transport** using readily available components.
- Keep build steps simple, repeatable, and inexpensive.
- Generate test artifacts (captures, photos, wiring diagrams) that can later inform certification evidence.

### Bill of Materials (illustrative; substitute equivalent parts as needed)

- **(2) Copper↔Fiber Media Converters** (e.g., 1000BASE-T to 1000BASE-SX)
- **(1) Unmanaged Ethernet Switch** for the destination/monitoring side
- **(1) Optical Patch Cable** (simplex if available, or use a duplex pair but connect only one strand)
- **(2–3) Cat6 Patch Cables**
- **(2) Power Supplies** for the converters (separate power domains recommended)
- Optional:
  - **SFP-based small switch** in lieu of standalone converters
  - **WDM simplex pair** (different TX/RX wavelengths) to enforce directionality at the optics layer
  - **Inline optical attenuator/dust caps** to permanently block the reverse strand where duplex patching is unavoidable

### Reference Topology

```
[High-Side Source Network or OT Tap/SPAN]
        |
        +--(Cat6)--> [Media Converter A (TX only path used)]
                           |
                           +--(Fiber: single strand, TX from A to RX on B)-->
                                                         |
                                          [Media Converter B] --(Cat6)--> [Unmanaged Switch]
                                                                                 |
                                                                        [Collectors / SIEM Ingest / Forensic Box]
```

**Crucial detail:** Only **one optical direction** is physically present — **TX from the high side into RX on the low side**. There is **no return fiber**. If hardware uses a duplex LC/SC jumper, leave the reverse strand **unconnected** and physically shrouded (e.g., capped).

### Assembly Steps

1. **Isolate Power Domains**
   - Power Media Converter A (high side) from one outlet/UPS domain.
   - Power Media Converter B (low side) from a different outlet/UPS domain (preferred).

2. **Copper Wiring**
   - Connect the **high-side source port** (e.g., an aggregation TAP/SPAN or a telemetry host) via **Cat6** to Media Converter A.
   - Connect Media Converter B via **Cat6** to the **destination switch**, where collectors/ingesters reside.

3. **Optical One-Way Link**
   - Use **one** fiber strand from **A(TX) → B(RX)**.
   - **Do not** connect B(TX) → A(RX). Cap or physically remove the second strand.
   - If your converters require link presence for L1/L2, prefer models that **do not** require a return light for TX to operate, or disable **Link Fault Pass-Through (LFP)** if possible.
   - Alternative: Use a **WDM simplex pair** that only provides a single optical wavelength from A to B, leaving the reverse wavelength device absent.

4. **Bring-Up**
   - Verify LEDs: A should show copper link and laser activity; B should show optical RX and copper link to the destination switch.
   - Expect **no link** indicators on the absent reverse path.

### Functional Testing & Evidence Collection

**Goal:** Prove that **no frames** originating on the destination can ever reach the source.

1. **Packet Capture Baseline**
   - On the high-side (source) segment, run `tcpdump`/Wireshark to capture for 5–10 minutes during test traffic.
   - On the low-side (destination) segment, run a parallel capture.

2. **Negative Path Tests (must fail)**
   - From the destination, attempt to **ping** or **ARP** the source segment.  
     - Expect **no ARP resolution** and **no ICMP echo** visible on the high-side capture.
   - Send crafted **TCP SYN** or **UDP** packets from destination toward high-side addresses.  
     - Expect **no L2/L3 presence** on the high-side capture.

3. **Positive Flow Tests (must succeed one-way)**
   - From the source, transmit **unidirectional telemetry** (e.g., UDP syslog, NetFlow/IPFIX, Kafka over one-way proxies, file drops via guard process).  
     - Expect delivery to destination capture/collector.
   - Note: Protocols requiring acknowledgments (e.g., TCP end-to-end) will **not** function natively without a unidirectional proxy or data guard.

4. **Artifacts to Save**
   - Photos of physical wiring showing the **missing reverse fiber**.
   - Switch/converter LED status during tests.
   - Packet capture files (`.pcapng`) from both sides.
   - Test logs summarizing commands, timestamps, checksums, and outcomes.

### Operational Considerations & Limitations (POC)

- **Autonegotiation & LFP:** Some converters use **Link Fault Pass-Through** or require light on both directions to assert link. Choose models that allow TX without RX, or disable LFP.
- **No Acknowledgments:** Native TCP streams will stall. For production, add **application-layer unidirectional proxies/guards** or convert flows to **UDP/append-only** patterns.
- **Health Monitoring:** The POC lacks built-in heartbeat/sequence reporting. Use an app-level **heartbeat message** and destination-side alarms to detect link degradation.
- **No Formal Certification Yet:** The POC demonstrates physics-level blocking but is **not certified**. Keep management interfaces disabled/isolated; avoid “smart” converters with remote management backplanes.

### Security Hardening Tips (POC)

- Prefer **dumb** media converters (no IP management plane).
- **Physically block** the unused optical receptacle (dust cap + tamper seal).
- Apply **tamper-evident labels** over converter screws and fiber ferrules.
- Power converters from **independent** power circuits/UPS where feasible.
- Maintain a **build log** (serial numbers, photos, wiring diagram) for reproducibility.

### Cost Envelope (illustrative)

- Media converters: **$25–$60 each × 2**
- Unmanaged switch (destination): **$20–$60**
- Fiber & copper patching: **$10–$30**
- **Estimated POC total:** **$100–$200** (excluding tools)

---

## Path from POC to Production

1. **Electronics Integration**
   - Replace two COTS converters with a **single board**: dedicated laser TX toward destination; omit/disable RX on the high side at the hardware level.
   - Add **watchdog microcontroller** for heartbeat, frame-count telemetry, temperature, and optical power monitoring (exposed only on the **destination** side).

2. **Mechanical & Environmental**
   - Design a **sealed, tamper-evident enclosure** with break-away screws and intrusion switch.
   - Validate across **temperature, vibration, and EMC** profiles typical of substations/plant floors.

3. **System Behavior & Guards**
   - Integrate an **application-layer data guard** on the high side to transform bidirectional protocols into one-way patterns (e.g., TCP→UDP encapsulation, file drop with checksums/sequence).
   - Add **buffers** to handle bursty telemetry and graceful degradation (store-and-forward to prevent data loss when destination is saturated).

4. **Assurance & Certification**
   - Define a **Protection Profile** (threat model, assets, security objectives).
   - Build a **verification harness**: optical loopbacks (forbidden), impedance tests, packet fuzzing, and capture-based regression suites.
   - Pursue **IEC 62443 alignment** and consider **Common Criteria** where customer/regulatory environments demand it.
   - Produce **traceable evidence** from POC → EVT → DVT → PVT builds.

---

## End State

A **certified, production-grade hardware diode** that:

- **Substantially lowers cost**, enabling adoption by small and mid-size operators.
- **Demonstrably enforces** unidirectional transport with hardware guarantees.
- **Offers operational reliability** (heartbeat, health telemetry, buffering).
- **Fits common integrations** (SIEM/DFIR pipelines, historians, data lakes) without proprietary lock-in.
- Can be **audited and certified** using a documented, repeatable verification harness.

---

## Conclusion

Starting with an **off-the-shelf POC** proves feasibility quickly and cheaply, generates early evidence, and de-risks the pathway to a **custom integrated design**. With targeted electronics integration, environmental hardening, and formal verification, this approach yields a **certifiable diode** that materially reduces barriers to OT security.

The progression is deliberate:
1. **COTS POC** (demonstrate physics and capture evidence),
2. **Optimized hardware** (integrated TX-only design with monitoring),
3. **Certification** (repeatable assurance with standards alignment).

The result is an accessible, trustworthy unidirectional gateway that helps critical operators protect the systems that matter most.
