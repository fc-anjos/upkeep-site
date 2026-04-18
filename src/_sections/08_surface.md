---
kind: surface
id: surface
order: 8
num: "§ 07"
title: "The whole API, on one page"
subtitle: "five methods · everything else is plain Rails"
rows:
  - heading: "make a model live"
    body: >
      One line. Every view that touches this model updates in real time across
      every connected browser.
    code_html: |
      <span class="kw">class</span> <span class="tag">Message</span> &lt; <span class="tag">ApplicationRecord</span>
        <span class="kw">include</span> <span class="tag">Upkeep</span>::<span class="tag">Broadcastable</span>
      <span class="kw">end</span>
  - heading: "coalesce a burst"
    body: >
      Thousand-row imports collapse to one push per affected record. Your
      users see one update, not a thousand flickers.
    code_html: |
      <span class="tag">Upkeep</span>.batch <span class="kw">do</span>
        messages.each { |m| m.update!(<span class="sym">status:</span> <span class="str">"archived"</span>) }
      <span class="kw">end</span>
  - heading: "batching across jobs"
    body: >
      The same coalescing inside ActiveJob, Sidekiq, or a plain Thread.
      Background work stays invisible until it's done.
    code_html: |
      <span class="tag">Upkeep</span>.batch_global <span class="kw">do</span>
        <span class="tag">Message</span>.find_each { |m| m.touch }
      <span class="kw">end</span>
  - heading: "a nudge instead of a push"
    body: >
      When you want the cheapest possible update, tell clients "something
      changed" and let them refetch via a normal HTTP GET.
    code_html: |
      <span class="tag">Upkeep</span>.version_bump(<span class="sym">@board</span>)
  - heading: "stay silent"
    body: >
      Migrations, backfills, audit logs, anything you don't want to push. The
      escape hatch is one block.
    code_html: |
      <span class="tag">Upkeep</span>.skip_tracking <span class="kw">do</span>
        <span class="tag">Message</span>.update_all(<span class="sym">status:</span> <span class="str">"migrated"</span>)
      <span class="kw">end</span>
---
