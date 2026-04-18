---
kind: lessons
id: lessons
order: 5
num: "§ 04"
title: "Six things server-side reactivity got wrong"
subtitle: "and how we fixed each one"
lede: >
  Live HTML from the server is an old idea. Previous attempts hit the same six
  walls. Each is a real engineering problem with a real solution. Here they
  are, with the fix shown next to each one.
cards:
  - big: "01"
    kind_label: "Per-client state that never stops growing"
    past: >
      Earlier systems kept a copy of every row each client had seen, so the
      server could diff new data against it. As clients queried more data, the
      per-client buffer grew without bound. Long-lived sessions eventually
      OOM'd the server.
    present: >
      Per-channel state is bounded structurally. We hold read-set predicates
      and a small delivery cap, not a shadow copy of the database. The upcoming
      result-hash refactor reduces this to a 32-byte hash per fragment per
      subscriber.
    diagram: state-growth
    diagram_then: "then: buffer grows"
    diagram_now: "now: bounded"
  - big: "02"
    kind_label: "Every write checked against every subscription"
    past: >
      When a row changed, the server asked every open subscription, “do you
      care about this?” With a thousand subscribers, one write became a
      thousand predicate checks. Throughput fell off a cliff long before CPU
      did.
    present_html: |
      A centralized router indexes subscriptions by <code>(table, column, value)</code>. On a write, it looks up exactly the subscriptions that care, in <code>O(log N + k)</code>. Ranges and negations fall into a small always-check set.
    diagram: fanout-check
    diagram_then: "then: every sub checked"
    diagram_now: "now: indexed lookup"
  - big: "03"
    kind_label: "Everything reactive, nothing measurable"
    past: >
      Reactivity was on for every model and every query by default. When the
      server fell over, there was no way to see which view, which query, or
      which model was responsible. You could not profile what you could not
      name.
    present_html: |
      Reactivity is opt-in per model. Every step emits an <code>ActiveSupport::Notifications</code> event: <code>upkeep.invalidation</code>, <code>upkeep.overlap_check</code>, <code>upkeep.batch_flush</code>. You profile a live view the way you profile SQL.
    diagram: cost-visibility
    diagram_then: "then: opaque"
    diagram_now: "now: instrumented"
  - big: "04"
    kind_label: "No backpressure on bursts"
    past: >
      A bulk import emitted a write per row. Each write produced one push per
      affected subscriber. A reasonable import became millions of frames on
      the wire, and the first server to notice was the one that crashed.
    present_html: |
      Bursts are coalesced at every boundary. Per-channel queues merge duplicates, in-flight delivery is capped, a splay spreads fan-out, and <code>Upkeep.batch</code> collapses a thousand updates into one push per affected record on purpose.
    diagram: backpressure
    diagram_then: "then: firehose"
    diagram_now: "now: coalesced"
  - big: "05"
    kind_label: "Stateful connections, sticky sessions"
    past: >
      Each WebSocket held session state the server could not reproduce. Load
      balancers needed sticky sessions, deploys dropped live state, and
      horizontal scaling meant copying that state between nodes over the
      network.
    present_html: |
      The render path is a pure function of <code>(url, fragment_id, locals, snapshot)</code>. The substrate for a stateless sidecar is already in place. Connections become cheap and portable.
    diagram: stateless
    diagram_then: "then: sticky to one box"
    diagram_now: "now: any worker"
  - big: "06"
    kind_label: "Server-side rendering as the performance floor"
    past: >
      Every update re-ran a whole template on the server. Render cost
      compounded with fan-out. Teams migrated to clients-render-everything
      architectures to escape it.
    present: >
      Fragments render in roughly 0.3 ms in-process; full pages in 2.5 ms. The
      pipeline is stateless, so render workers scale horizontally. Statics are
      cached once; only the dynamics travel on each update.
    diagram: render-scale
    diagram_then: "then: one renderer"
    diagram_now: "now: horizontal"
invariants_title: "The principles we hold"
invariants_subtitle: "six invariants that hold at every scale"
invariants:
  - n: "I"
    heading: "ReadSet is the source of truth"
    body: "All invalidation decisions flow from predicate overlap, never from stream membership."
  - n: "II"
    heading: "Rendering is a pure function"
    body_html: |
      <code>(url, fragment_id, locals, snapshot) → (statics, dynamics, read_set)</code>. No side effects, no connection state.
  - n: "III"
    heading: "Delivery is targeted"
    body: "The system knows which subscriptions are affected before sending. Broadcast-then-filter is the anti-pattern."
  - n: "IV"
    heading: "Backpressure at every boundary"
    body: "Per-channel queue, in-flight cap, drain limits, splaying, batch coalescing. Never unbounded."
  - n: "V"
    heading: "Cost is visible"
    body: "Every invalidation, render, and delivery is instrumented via ActiveSupport::Notifications."
  - n: "VI"
    heading: "Reactivity is explicit"
    body: "Models opt in. Columns can be filtered. Bulk operations can skip tracking."
---
