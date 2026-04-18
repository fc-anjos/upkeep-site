---
kind: perf
id: perf
order: 7
num: "§ 06"
title: "Built for fanout"
subtitle: "one write, many viewers · the shape that breaks other systems"
lede_html: |
  The hard part of live HTML is not rendering. It is routing. When one write has to reach <em>N</em> viewers, the system's scaling behavior is whatever it costs to decide who gets the update. We benchmark the two fanout shapes that cover most real apps.
patterns:
  - tag: "Pattern A"
    heading: "Broadcast fanout"
    body: >
      One write visible to a shared audience. Every viewer on a channel sees
      the same update. Typical of activity feeds, live scoreboards, shared
      timelines, and anything with a room model.
    svg: |
      <svg class="pattern-svg" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
        <circle cx="30" cy="60" r="10" fill="var(--orange)"/>
        <text x="30" y="92" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="var(--ink-3)">1 write</text>
        <g stroke="var(--ink-3)" stroke-width="1" fill="none" opacity="0.55">
          <path d="M 40 60 L 150 22"/><path d="M 40 60 L 150 40"/><path d="M 40 60 L 150 58"/><path d="M 40 60 L 150 76"/><path d="M 40 60 L 150 94"/>
        </g>
        <g fill="var(--blue)"><circle cx="160" cy="22" r="5"/><circle cx="160" cy="40" r="5"/><circle cx="160" cy="58" r="5"/><circle cx="160" cy="76" r="5"/><circle cx="160" cy="94" r="5"/></g>
        <text x="220" y="64" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="var(--ink-3)">N viewers</text>
      </svg>
  - tag: "Pattern B"
    heading: "Graph fanout"
    body: >
      Many writers, many viewers, each viewer seeing a different slice. Cards
      move, users drag, filters cross. Typical of kanbans, shared documents,
      CRMs, and dashboards where each pane shows a different query.
    svg: |
      <svg class="pattern-svg" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
        <g fill="var(--orange)"><circle cx="30" cy="30" r="7"/><circle cx="30" cy="60" r="7"/><circle cx="30" cy="90" r="7"/></g>
        <text x="30" y="108" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="var(--ink-3)">writers</text>
        <g stroke="var(--ink-3)" stroke-width="1" fill="none" opacity="0.45">
          <path d="M 38 30 L 150 22"/><path d="M 38 30 L 150 58"/><path d="M 38 60 L 150 40"/><path d="M 38 60 L 150 76"/><path d="M 38 90 L 150 58"/><path d="M 38 90 L 150 94"/>
        </g>
        <g fill="var(--blue)"><circle cx="160" cy="22" r="5"/><circle cx="160" cy="40" r="5"/><circle cx="160" cy="58" r="5"/><circle cx="160" cy="76" r="5"/><circle cx="160" cy="94" r="5"/></g>
        <text x="220" y="64" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="var(--ink-3)">different slices</text>
      </svg>
throughput:
  title: "Throughput vs Turbo (p50, relative)"
  bars:
    - { label: "broadcast · upkeep", bar_class: "", width: "100%", num: "20×" }
    - { label: "broadcast · turbo", bar_class: "alt", width: "5%", num: "1×" }
    - { label: "graph · upkeep", bar_class: "", width: "45%", num: "9×" }
    - { label: "graph · turbo", bar_class: "alt", width: "5%", num: "1×" }
latency:
  title: "Latency and footprint"
  stats:
    - { n: "0.3", unit: "ms", label: "per-fragment render, in-process" }
    - { n: "2.5", unit: "ms", label: "full-page render, in-process" }
    - { n: "3–5", unit: "ms", label: "p99 invalidation latency, microbenchmark" }
    - { n: "309", unit: "MB", label: "peak RSS (upkeep) vs 118 MB (turbo)" }
disclaimer: >
  20× on broadcast fanout, 9× on graph fanout, at p50. Invalidation latency
  lands inside a single Rails request cycle. The pipeline is already stateless,
  so a dedicated render sidecar is a deployment change rather than a rewrite —
  the next order of magnitude comes from there.
---
