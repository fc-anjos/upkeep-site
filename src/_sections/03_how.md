---
kind: arch
id: how
order: 3
num: "§ 02"
title: "How it works"
subtitle: "five pieces · small, auditable, fast"
rows:
  - num: "01"
    label: "the compiler"
    heading: "Herb + ReActionView turn ERB into instrumented templates."
    sub: "parse · walk · rewrite · at boot"
    body_html: |
      <p>Rails' default ERB handler is an opaque string concatenator. It produces output; it doesn't know what is an expression, what is a tag, what is a conditional. That makes dependency tracking impossible from the outside.</p>
      <p>Herb is an HTML-aware ERB parser written in C with Ruby, JS, and WASM bindings. It produces a real AST: <code>&lt;h1&gt;</code> becomes an <code>HTMLElementNode</code>, <code>&lt;%= @message.title %&gt;</code> an <code>ERBContentNode</code> inside it. ReActionView plugs that parser into Rails as a template handler, replacing erubi for reactive partials.</p>
      <p>Upkeep hooks into the compilation pipeline and rewrites the tree. Every <code>&lt;%= expr %&gt;</code> becomes <code>Capture.capture(slot_index)</code>. Every <code>&lt;% if %&gt;</code> / <code>&lt;% elsif %&gt;</code> becomes <code>Capture.branch</code>. Every <code>@ivar</code> read becomes <code>Capture.ivar</code>. Reactive partials get wrapped in a <code>&lt;signal-fragment&gt;</code> boundary.</p>
      <div class="callout">During a normal page render the Capture calls are zero-cost passthroughs. During a re-render they record a slot-by-slot decomposition of the fragment. Invisible to authors; you still see plain ERB.</div>
  - num: "02"
    label: "read-set tracking"
    heading: "The BatchBroadcasts middleware captures what each render touched."
    sub: "predicates · type-cast · structured"
    body_html: |
      <p>When a request comes in, QueryTracking activates: an <code>ActiveRecord::Relation</code> prepend that intercepts every query method and captures its WHERE predicates as structured <code>Predicate</code> objects, one per condition: <code>(table, column, operator, value, type)</code>.</p>
      <p>Values go through ActiveRecord's type system, so the String <code>"42"</code> and the Integer <code>42</code> collapse to the same predicate. The render runs, and the middleware collects every predicate into a <code>ReadSet</code>:</p>
      <pre class="code" style="background:var(--paper-2); border:1px solid var(--paper-rule); padding:12px 14px; margin-top:10px; font-size:12px;">ReadSet {
        (messages, room_id, =,  17),
        (users,    id,      IN, [3, 8, 12]),
        (rooms,    id,      =,  17),
      }</pre>
      <div class="callout blue">The page is a materialized view; the ReadSet is its defining query. That single idea replaces every broadcast target, cache key, and <code>touch:</code> chain in your app.</div>
  - num: "03"
    label: "subscription &amp; handoff"
    heading: "Rack env is captured with the read-set and stored."
    sub: "replay-ready · per-subscriber · signed handoff"
    body_html: |
      <p>After the render, the middleware captures the rack env: cookies, session, Warden state, everything needed to replay the render with the same <code>current_user</code>. It stores the URL, ReadSet, fragment metadata (locals, partial paths, record reverse index), and slot states in the configured subscription store (<code>:memory</code>, <code>:broker</code>, or <code>:active_record</code>).</p>
      <p>Before the response goes out, a <code>&lt;signal-stream-source&gt;</code> element is auto-injected with a signed token referencing the subscription. The browser parses it, opens an ActionCable connection, and subscribes to the per-subscription stream.</p>
  - num: "04"
    label: "the trigger"
    heading: "Invalidation is explicit per model. Routing is O(log N + k)."
    sub: "Kung-Robinson 1981 · Convex-style index"
    body_html: |
      <p>Reactivity is per-model and opt-in. A <code>Broadcastable</code> model's <code>after_commit</code> calls <code>Upkeep.invalidate(record, event:, changes:)</code>. The payload includes both current and pre-change values, because a row that no longer matches a query still needs to evict itself from read-sets that previously captured it.</p>
      <p>The <b>InvalidationRouter</b> picks a transport. Small deployments broadcast to a table-scoped ActionCable stream and each channel runs its own overlap check. Larger ones consult a shared SubscriptionIndex: a two-tier <code>(table, column, value)</code> hash for equality and <code>IN</code>, plus an always-check set for ranges and negations. Lookup is <code>O(log N + k)</code>, the same data structure Convex uses in production.</p>
      <p>Each receiving channel runs the overlap check: does the changed row satisfy any predicate in my read-set? If <code>room_id</code> changed from 17 to 22, two read-sets are affected: the one that matched <code>room_id = 17</code> (losing the row) and the one that matches <code>room_id = 22</code> (gaining it). The check is O(predicates), not O(rows).</p>
      <div class="callout">If nothing overlaps, the channel does nothing. Most updates touch most subscriptions zero times. That is where the scale comes from.</div>
  - num: "05"
    label: "re-render, diff, morph"
    heading: "In-process render. Statics cached. Dynamics streamed."
    sub: "per-fragment fast path · full-page fallback"
    body_html: |
      <p>On positive overlap the channel re-renders in-process, in the same Ruby process as the WebSocket. Two paths exist. Per-fragment runs only that partial through ActionView, restoring I18n locale, time zone, and <code>Current</code> attributes from the captured snapshot. Full-page runs an in-process Rack call through the captured rack env when the fragment touches state outside the partial.</p>
      <p>The new render executes with <code>SlotContext</code> set, so the Capture calls now fire and emit a fresh <b>statics</b> / <b>dynamics</b> decomposition. The channel diffs against the stored slot state and ships only the changed dynamics:</p>
      <pre class="code" style="background:var(--paper-2); border:1px solid var(--paper-rule); padding:12px 14px; margin-top:10px; font-size:12px;"><span class="cmt"># first push: statics + dynamics</span>
      { <span class="str">"fragments"</span>: [{ <span class="str">"id"</span>: <span class="str">"card_42_frag_91eaf6fb"</span>,
                      <span class="str">"s"</span>: [<span class="str">"&lt;h1&gt;"</span>, <span class="str">"&lt;/h1&gt;"</span>],
                      <span class="str">"d"</span>: { <span class="str">"0"</span>: <span class="str">"Updated Title"</span> } }] }

      <span class="cmt"># subsequent pushes: dynamics only</span>
      { <span class="str">"fragments"</span>: [{ <span class="str">"id"</span>: <span class="str">"card_42_frag_91eaf6fb"</span>,
                      <span class="str">"d"</span>: { <span class="str">"0"</span>: <span class="str">"New Title"</span> } }] }</pre>
      <p>The client merges changed dynamics with cached statics, reconstructs full HTML, and uses Idiomorph to morph the existing fragment in place. Focus, cursor, scroll, form state, and Stimulus instances survive the update. The UI never flickers.</p>
---
