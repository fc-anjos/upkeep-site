---
kind: hero
id: hero
order: 1
eyebrow: "live UIs for Rails · open source"
tagline_main: "Rails,"
tagline_accent: "live by default."
tagline_soft: "Write normal ERB. Ship realtime apps."
lede: >
  Upkeep makes every server-rendered page reactive. Change a record; every
  browser viewing the views that depend on it updates in place. No broadcasts
  to wire up, no cache keys to maintain, no SPA to build. Rails apps move at
  chat-app speed with the productivity of plain ERB.
lede_two_html: |
  The whole surface is <b>one line per reactive model</b>. The rest of your
  app is the Rails you already write. Behind the scenes, Upkeep tracks what
  each render touched and, when data changes, pushes only the HTML that
  actually changed to only the clients that care. Targeted, fast, and small
  enough to reason about.
diagram_label: "fig. 1 · read-set · overlap · push"
diagram_caption: "standby · read-sets recorded during initial render"
codepair:
  - filename: "app/views/cards/_card.html.erb"
    pill: "ERB"
    code_html: |
      <span class="cmt">&lt;%# a plain partial · nothing upkeep-specific %&gt;</span>
      &lt;<span class="tag">article</span> <span class="sym">class</span>=<span class="str">"card"</span> <span class="sym">id</span>=<span class="str">"&lt;%= dom_id(card) %&gt;"</span>&gt;
        &lt;<span class="tag">h3</span>&gt;<span class="erb">&lt;%= card.title %&gt;</span>&lt;/<span class="tag">h3</span>&gt;
        &lt;<span class="tag">p</span>&gt;<span class="erb">&lt;%= card.body %&gt;</span>&lt;/<span class="tag">p</span>&gt;
        &lt;<span class="tag">footer</span>&gt;
          <span class="erb">&lt;%= render card.assignee %&gt;</span>
          &lt;<span class="tag">time</span>&gt;<span class="erb">&lt;%= time_ago_in_words(card.updated_at) %&gt;</span>&lt;/<span class="tag">time</span>&gt;
        &lt;/<span class="tag">footer</span>&gt;
      &lt;/<span class="tag">article</span>&gt;
  - filename: "app/controllers/cards_controller.rb"
    pill: "Ruby"
    code_html: |
      <span class="kw">class</span> <span class="tag">Card</span> &lt; <span class="tag">ApplicationRecord</span>
        <span class="kw">include</span> <span class="tag">Upkeep</span>::<span class="tag">Broadcastable</span>
      <span class="kw">end</span>

      <span class="cmt"># That is the whole API. Any page that renders a Card</span>
      <span class="cmt"># now updates live, in every connected browser,</span>
      <span class="cmt"># whenever a Card changes. No broadcasts to wire,</span>
      <span class="cmt"># no cache keys, no Stimulus gymnastics.</span>
---
<svg viewBox="0 0 980 260" aria-label="records, fragments, clients">
  <text x="80"  y="24" class="stage-label">records</text>
  <text x="380" y="24" class="stage-label">fragments (read-sets)</text>
  <text x="800" y="24" class="stage-label">subscribers</text>

  <g id="h-recs">
    <g class="node" data-id="r1" transform="translate(60,50)"><rect width="160" height="38" rx="1"/><text x="12" y="24">Card#42</text></g>
    <g class="node" data-id="r2" transform="translate(60,102)"><rect width="160" height="38" rx="1"/><text x="12" y="24">Card#43</text></g>
    <g class="node" data-id="r3" transform="translate(60,154)"><rect width="160" height="38" rx="1"/><text x="12" y="24">User#7</text></g>
  </g>

  <g id="h-frags">
    <g class="node" data-id="f1" transform="translate(360,40)"><rect width="300" height="50" rx="1"/><text x="12" y="20">_card.html.erb</text><text x="12" y="38" opacity=".6">reads: Card#42</text></g>
    <g class="node" data-id="f2" transform="translate(360,100)"><rect width="300" height="50" rx="1"/><text x="12" y="20">_lane.html.erb</text><text x="12" y="38" opacity=".6">reads: Card#42, Card#43</text></g>
    <g class="node" data-id="f3" transform="translate(360,160)"><rect width="300" height="50" rx="1"/><text x="12" y="20">_avatar.html.erb</text><text x="12" y="38" opacity=".6">reads: User#7</text></g>
  </g>

  <g id="h-clients">
    <g class="node" data-id="c1" transform="translate(790,50)"><rect width="140" height="38" rx="1"/><text x="12" y="24">session A</text></g>
    <g class="node" data-id="c2" transform="translate(790,102)"><rect width="140" height="38" rx="1"/><text x="12" y="24">session B</text></g>
    <g class="node" data-id="c3" transform="translate(790,154)"><rect width="140" height="38" rx="1"/><text x="12" y="24">session C</text></g>
  </g>

  <g>
    <path class="edge read" data-rf="r1-f1" d="M220 69 C 280 69, 320 65, 360 65"/>
    <path class="edge read" data-rf="r1-f2" d="M220 69 C 290 95, 320 122, 360 125"/>
    <path class="edge read" data-rf="r2-f2" d="M220 121 C 280 121, 320 124, 360 125"/>
    <path class="edge read" data-rf="r3-f3" d="M220 173 C 280 173, 320 183, 360 185"/>
  </g>

  <g>
    <path class="edge push" data-fc="f1-c1" d="M660 65 C 720 65, 760 65, 790 69"/>
    <path class="edge push" data-fc="f2-c1" d="M660 125 C 720 105, 760 80, 790 75"/>
    <path class="edge push" data-fc="f2-c2" d="M660 125 C 720 125, 760 124, 790 121"/>
    <path class="edge push" data-fc="f3-c3" d="M660 185 C 720 180, 760 175, 790 173"/>
  </g>

  <text x="60"  y="230" class="caption" id="h-caption">standby · read-sets recorded during initial render</text>
</svg>
