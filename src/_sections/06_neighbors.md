---
kind: compare
id: neighbors
order: 6
num: "§ 05"
title: "Where it fits"
subtitle: "next to LiveView, Turbo, and the data-side IVM stack"
headers:
  - ""
  - "Phoenix LiveView"
  - "Hotwire / Turbo Streams"
  - "Convex · ElectricSQL · Materialize"
  - "<strong>upkeep</strong>"
header_widths:
  - "22%"
rows:
  - row_header: "dependency graph lives"
    cells:
      - "in the LiveView module's assigns"
      - "in your head and in <code>broadcasts_to</code>"
      - "in the database's query plan"
      - "<strong>in the ReadSet</strong>, derived from the queries the render actually ran"
  - row_header: "authoring surface"
    cells:
      - "LiveView module plus HEEx"
      - "ERB + explicit stream targets"
      - "query language + subscriptions"
      - "<strong>normal ERB and normal ActiveRecord</strong>"
  - row_header: "transport shape"
    cells:
      - "statics + dynamics over socket"
      - "Turbo Stream HTML fragments"
      - "SQL deltas or patches"
      - "<strong>statics cached, dynamics streamed</strong>; Idiomorph on the client"
  - row_header: "view granularity"
    cells:
      - "whole LiveView"
      - "whatever you target"
      - "per-row"
      - "<strong>per-fragment</strong>, per-subscriber"
  - row_header: "the hard part"
    cells:
      - "state in a process"
      - "keeping broadcasts in sync with views"
      - "integrating with app code"
      - "<strong>render throughput</strong>; tier 2 sidecar is the path"
---
