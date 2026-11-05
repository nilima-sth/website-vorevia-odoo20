# Vorevia Technologies — Odoo 19 Technology Stack Audit

**Audit date:** 29 October 2026  
**Scope:** Read-only inspection and research. No application code, dependency, configuration, database, Git history, or deployment state was changed.

## 1. Executive recommendation

Choose a **native Odoo 19 website architecture**:

- **Python** only for Odoo models, protected HTTP/JSON controllers, and server-side integrations.
- **QWeb/XML** for server-rendered pages, layouts, and reusable Website Builder snippets.
- **SCSS/CSS** for the design system, responsive layout, and most motion.
- **Native JavaScript modules** using Odoo's public `Interaction` API for small progressive enhancements.
- **Owl** only for self-contained, stateful islands whose complexity warrants a component (for example, a future calculator or an advanced interactive explorer). It is not the page framework.
- **IntersectionObserver and CSS** as the normal motion baseline; retain the existing accessible tab and reveal behavior.
- **GSAP + ScrollTrigger**, locally bundled and loaded only for one or two proven high-value scroll narratives, if the design needs them after a performance prototype.
- **Native Odoo Live Chat** as the chat shell, scripted qualification flow, transcript store, operator handoff, and CRM/Helpdesk bridge. Use Odoo's native AI agent only if the Enterprise AI modules are enabled and licensed; otherwise begin with the native scripted chatbot.

Do **not** add React, Next.js, a global smooth-scroll library, or Three.js for the current marketing website. React has no material capability advantage here, while it introduces a second UI runtime, asset/build lifecycle, editor friction, and upgrade surface. A headless Next.js site would also replace the Website Builder editing workflow with a second deployment, API/authentication, cache, and content-preview system.

This recommendation is grounded in Odoo 19's own description of public Website pages as a classical routed website, distinct from its backend SPA, and in its documented asset, QWeb/theme, snippet, and public Owl-component mechanisms. See [Odoo's JavaScript reference](https://www.odoo.com/documentation/19.0/developer/reference/frontend/javascript_reference.html), [assets reference](https://www.odoo.com/documentation/19.0/developer/reference/frontend/assets.html), and [public Owl components guide](https://www.odoo.com/documentation/19.0/developer/howtos/frontend_owl_components.html).

## 2. Existing environment findings

### Verified local facts

- Core declares **Odoo 19.0** at `/opt/odoo19/odoo/odoo/release.py:15`; the source checkout is on the `19.0` branch.
- An `/opt/odoo19/enterprise` source tree is present and configured as an addon path, so this is an **Enterprise-capable source installation**. That does *not* prove an active database has Enterprise, AI, or Live Chat installed.
- No active Odoo process/database was available during the audit; therefore the live database's installed-module state and Website Builder behavior could not be certified.
- The custom module is `/opt/odoo19/odoo-custom-addons/website_vorevia`. It depends only on `website` and `website_blog` in [`__manifest__.py`](/opt/odoo19/odoo-custom-addons/website_vorevia/__manifest__.py:7).
- The module puts its SCSS and JavaScript into `web.assets_frontend` in [`__manifest__.py`](/opt/odoo19/odoo-custom-addons/website_vorevia/__manifest__.py:14). No React, GSAP, Lottie, Three.js, CDN runtime, or other third-party browser runtime is referenced.

### Module structure

```text
website_vorevia/
├── __manifest__.py
├── data/website_form_data.xml
├── models/consultation.py
├── security/ir.model.access.csv
├── static/src/
│   ├── img/                 # logo, favicon, and homepage imagery
│   ├── js/homepage.js
│   └── scss/{theme.scss,hero_refinement.scss}
└── views/
    ├── homepage.xml
    └── consultation_views.xml
```

There is also a divergent ignored backup, `views/homepage.xml.save`, and unused image candidates. They are maintenance noise but are not loaded by the manifest.

### Rendering, assets, and current frontend design

`views/homepage.xml` inherits `website.layout` for favicon/header/footer and `website.homepage` for the page body ([lines 3–87](</opt/odoo19/odoo-custom-addons/website_vorevia/views/homepage.xml:3>)). The homepage replaces `#wrap` with server-rendered QWeb markup ([lines 87–89](</opt/odoo19/odoo-custom-addons/website_vorevia/views/homepage.xml:87>)). Odoo compiles the manifest's SCSS and ES-module JavaScript into the public `web.assets_frontend` bundle, exactly as documented in the [Odoo 19 assets reference](https://www.odoo.com/documentation/19.0/developer/reference/frontend/assets.html).

The existing JavaScript is already on the intended Odoo 19 path: it imports `Interaction`, handles tabs, keyboard navigation, edit mode, `IntersectionObserver`, reduced-motion preference, and cleanup, then registers in `public.interactions` ([`homepage.js:1`](</opt/odoo19/odoo-custom-addons/website_vorevia/static/src/js/homepage.js:1>) and [`homepage.js:293`](</opt/odoo19/odoo-custom-addons/website_vorevia/static/src/js/homepage.js:293>)). This is a good fit for the current behavior; an Owl rewrite would not improve it.

The consultation form uses Odoo's standard website-form endpoint and creates `vorevia.consultation` records ([`homepage.xml:277`](</opt/odoo19/odoo-custom-addons/website_vorevia/views/homepage.xml:277>), [`website_form_data.xml:3`](</opt/odoo19/odoo-custom-addons/website_vorevia/data/website_form_data.xml:3>)). It is not currently a CRM-lead workflow: the module has no `crm` dependency, and its model is a standalone request record ([`consultation.py:4`](</opt/odoo19/odoo-custom-addons/website_vorevia/models/consultation.py:4>)).

### Website Builder assessment

The page has useful Builder-compatible elements: an `oe_structure` root, `s_text_block` section markers, and an `s_website_form` form ([`homepage.xml:89`](</opt/odoo19/odoo-custom-addons/website_vorevia/views/homepage.xml:89>), [`homepage.xml:269`](</opt/odoo19/odoo-custom-addons/website_vorevia/views/homepage.xml:269>)). The script deliberately makes tab panels visible while editing ([`homepage.js:19`](</opt/odoo19/odoo-custom-addons/website_vorevia/static/src/js/homepage.js:19>)).

It is nevertheless a hand-built fixed page, not a library of custom reusable snippets/options. Editors can alter text and structure, but design-system and component changes are code-controlled. That is acceptable for a carefully managed flagship homepage, but future repeatable content should be implemented as documented snippets and, where necessary, Builder plugins in `website.website_builder_assets`; see Odoo's [theming](https://www.odoo.com/documentation/19.0/developer/howtos/website_themes/theming.html) and [building-blocks](https://www.odoo.com/documentation/19.0/developer/howtos/website_themes/building_blocks.html) guides.

### Local risks to address only after architecture approval

1. **P1 — three copies of hero styling.** Hero refinements are duplicated in [`theme.scss:240`](</opt/odoo19/odoo-custom-addons/website_vorevia/static/src/scss/theme.scss:240>), [`hero_refinement.scss:1`](</opt/odoo19/odoo-custom-addons/website_vorevia/static/src/scss/hero_refinement.scss:1>), and an inline `<style>` ([`homepage.xml:90`](</opt/odoo19/odoo-custom-addons/website_vorevia/views/homepage.xml:90>)). This is three sources of truth.
2. **P1 — broad global layout replacement.** The module replaces every `website.layout` header/footer ([`homepage.xml:14`](</opt/odoo19/odoo-custom-addons/website_vorevia/views/homepage.xml:14>), [`homepage.xml:54`](</opt/odoo19/odoo-custom-addons/website_vorevia/views/homepage.xml:54>)), bypassing standard header/footer selection and omitting the base header's `no_header` safeguard. This is upgrade-sensitive.
3. **P2 — lead routing is unfinished.** Consultation form records are not automatically CRM leads, nor is an internal notification/assignment workflow defined.
4. **P2 — SEO is mainly inherited/configuration-dependent.** The module adds no dedicated per-page metadata or structured data. Odoo still supplies native sitemap/SEO facilities; see [Odoo SEO documentation](https://www.odoo.com/documentation/19.0/applications/websites/website/structure/seo.html).
5. **P2 — image and backup housekeeping.** Several images have no production reference and the `.save` file is stale. Retain or remove them only after confirming ownership and use.

## 3. Research findings

### Official Odoo 19 findings

- Odoo packages public JS, SCSS/CSS, and XML as named asset bundles; `web.assets_frontend` is the normal public website bundle. This validates the module's present loading model. [Assets](https://www.odoo.com/documentation/19.0/developer/reference/frontend/assets.html)
- Odoo 19 explicitly supports public Owl components: register under `public_components`, add files to `web.assets_frontend`, and mount with `<owl-component>`. This is an island mechanism, not a mandate to turn the site into Owl. [Use Owl components on portal and website](https://www.odoo.com/documentation/19.0/developer/howtos/frontend_owl_components.html)
- Odoo's Website Builder is based on module-packaged themes, QWeb and editable building blocks; custom Builder options use their own asset bundle. [Theming](https://www.odoo.com/documentation/19.0/developer/howtos/website_themes/theming.html), [building blocks](https://www.odoo.com/documentation/19.0/developer/howtos/website_themes/building_blocks.html)
- Native controllers support public routes, HTTP/JSON-RPC typing, CSRF configuration, and captcha routing. Security remains the module author's responsibility. [Web controllers](https://www.odoo.com/documentation/19.0/developer/reference/backend/http.html)
- Odoo 19's Live Chat supports website channel rules, country/URL targeting, operator availability, embedded widgets, scripted bots, lead capture and operator handoff. [Live Chat](https://www.odoo.com/documentation/19.0/applications/websites/livechat.html), [Chatbots](https://www.odoo.com/documentation/19.0/applications/websites/livechat/chatbots.html)
- The local source confirms `im_livechat` has the scripted-bot step model, and Enterprise source includes `ai`, `ai_livechat`, `ai_website`, `ai_crm`, and `ai_crm_livechat`. In particular, `ai_livechat` adds an `ai_agent_id` to a Live Chat rule ([`im_livechat_channel_rule.py:6`](</opt/odoo19/enterprise/ai_livechat/models/im_livechat_channel_rule.py:6>)). Do not treat source presence as a claim that the target database has these modules installed.
- If AI and Live Chat are installed, Odoo 19 documents an AI agent that can respond, qualify and create leads; an AI agent takes precedence over a scripted bot on the same rule. [AI Live Chat](https://www.odoo.com/documentation/19.0/applications/productivity/ai/live-chat.html)

### External implementation guidance

The [OCA website repository](https://github.com/OCA/website) currently has Odoo 19 website addons and is useful for narrow, compatible patterns, but it is community guidance rather than an architecture authority. Use its module manifest/license on a case-by-case basis rather than adopting a collection wholesale.

For motion, platform-neutral browser APIs are the lowest-risk baseline: [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) and [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion). GSAP's own documentation supports responsive/reduced-motion setup and ScrollTrigger is intentionally compatible with native scrolling; it is appropriate only for the rare story that CSS cannot express cleanly. [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)

## 4. Technology comparison

| Criterion | Native Odoo 19 | Isolated React sections | Headless React/Next.js |
|---|---|---|---|
| Odoo 19 compatibility | Excellent; uses documented contracts | Moderate; custom asset/lifecycle integration | Low; replaces the website frontend contract |
| Website Builder | Full when built as QWeb snippets | Limited inside a mounted root | None for page editing; requires a separate CMS/preview strategy |
| SEO / first render | Strong: QWeb HTML is server-rendered | Outer document strong; island content may await JS | Strong only after SSR/SSG and cache design are implemented |
| Premium visual ceiling | High with CSS, SVG, GSAP/Owl where appropriate | High, but not because React itself animates better | High, but at a much larger platform cost |
| Deployment | Existing Odoo deployment | Existing deployment plus a JS dependency/bundle process | Odoo plus Node runtime, reverse proxy/cache, API/auth/CORS, observability and deployment coordination |
| Content maintenance | Fits current editors and Odoo assets | Mixed ownership of content and mounted state | Split between Odoo and separate frontend/content pipeline |
| Performance / CWV | Best baseline: no extra framework runtime | Extra download/hydration cost | Can be excellent, but requires active engineering and infrastructure |
| Security / upgrades | One auth/data boundary; documented extension points | Extra DOM/lifecycle and supply-chain surface | New public API boundary and two independent upgrade streams |

**Selection: Native Odoo 19.** It preserves visual freedom while retaining server-rendered content, Website Builder value, Odoo forms/CRM, and a single operational deployment. React becomes defensible only if Vorevia later ships a truly product-like isolated tool with requirements demonstrably beyond Owl/native modules. A public corporate website is not that case.

## 5. Animation and interaction stack

| Feature | Recommendation | Why / guardrails |
|---|---|---|
| Homepage hero | Semantic QWeb, optimized WebP/SVG, CSS transforms/transitions; optional short GSAP entrance only after profiling | Keeps primary message visible without JavaScript; no canvas/video dependency |
| Connected-business workflow | Inline SVG with static labels; use one bounded GSAP timeline only if it makes relationships clearer | Diagram remains understandable in its resting state and under reduced motion |
| Odoo application showcase | Keep server-rendered semantic tabs and current `Interaction`; use an Owl island only if dynamic state/data grows materially | Current keyboard tabs are already a good solution; React adds nothing |
| Scroll-driven implementation story | CSS/IntersectionObserver for reveals; one desktop-only GSAP ScrollTrigger sequence if user testing shows it improves comprehension | Provide ordinary stacked content on mobile and a non-moving reduced-motion version |
| Hover / micro-interactions | CSS only | Fast, low weight, and easy to maintain |
| Responsive navigation | Existing Bootstrap-compatible collapse/nav pattern | Preserve real links, focus management, and native anchor behavior |
| FAQ / accordions | Existing semantic Bootstrap collapse patterns | Retain buttons, `aria-expanded`, focus visibility and readable content without JS |
| Floating chat | Native Odoo Live Chat widget styled through the theme; custom Owl only if a concrete branding/control gap remains | Keeps sessions, transcripts, operators and CRM in one system |

Avoid a general smooth-scrolling library: it can interfere with anchors, browser history, keyboard navigation, assistive technology, and motion preferences. Avoid Three.js unless a specific 3D concept survives a content, mobile GPU, fallback, and accessibility review. Three.js is MIT-licensed, but the cost here is runtime/performance/maintenance, not licensing. [three.js project](https://github.com/mrdoob/three.js)

Every non-essential animation must honor `prefers-reduced-motion`; never place unique information solely in motion. The existing module already has a reduced-motion branch ([`homepage.js:16`](</opt/odoo19/odoo-custom-addons/website_vorevia/static/src/js/homepage.js:16>) and a CSS fallback ([`theme.scss:880`](</opt/odoo19/odoo-custom-addons/website_vorevia/static/src/scss/theme.scss:880>)).

## 6. Chatbot architecture

### Decision

Use the **native Odoo Live Chat widget and conversation model**. Deploy a scripted bot first; add Odoo's native Enterprise AI agent to the same channel only after confirming the database has a valid Enterprise entitlement, the modules are installed, and an approved provider/data policy exists. Do not build a separate React chatbot.

```text
Visitor
  │
  ▼
Native Odoo Live Chat widget
  ├─ scripted qualification (baseline)
  │     └─ consented contact → CRM lead / operator handoff
  └─ Enterprise AI agent (optional, source-restricted)
        ├─ curated public Vorevia/Odoo sources → answer
        └─ low confidence, demo, pricing, contract, or account request
              → collect consented details → one validated lead → human operator

Odoo server retains transcripts, sessions, routing, and provider credentials.
No browser code receives an AI API key.
```

Native scripted steps support text, choice, email, phone, free input and forward-to-operator; source confirms these step types at [`chatbot_script_step.py:23`](</opt/odoo19/odoo/addons/im_livechat/models/chatbot_script_step.py:23>). Configure the first version to handle only a narrow discovery path: service interest, company size/context, contact consent, requested callback/demo, and operator handoff. If there is no operator, state that honestly and collect a follow-up request.

The native AI option is the practical target only if it is enabled. Its public-facing scope should be restricted to reviewed, versioned, public sources; it should never query customer records, finance, internal CRM notes, or arbitrary web pages. It must decline uncertain implementation/pricing/contract answers and route them to a person. Odoo's documented agent behavior supports escalation and structured lead creation; it is not an excuse to grant broad model-driven access. [AI Live Chat](https://www.odoo.com/documentation/19.0/applications/productivity/ai/live-chat.html)

### Alternatives assessed

| Option | Verdict |
|---|---|
| Built-in scripted bot + Live Chat | **Adopt first.** Lowest operational cost; native transcript, handoff, and CRM path; no generative capability |
| Native Enterprise AI + Live Chat | **Adopt later if verified.** Best integrated AI route; requires entitlement, local configuration, provider costs/keys, sources and guardrails |
| Custom Owl + Python AI chat | Reserve for a concrete native-widget limitation or a required non-native model provider; reuse Odoo conversations/handoff rather than create a parallel chat system |
| React chat embedded in Odoo | Reject; duplicated runtime/state and no relevant capability benefit |
| External chatbot SaaS | Use only for a demonstrated omnichannel capability Odoo cannot provide; it introduces recurring cost, PII/transcript transfer, CRM synchronization, vendor lock-in and embed weight |

### Required safeguards

- Store provider credentials only server-side and never in XML, JavaScript, browser storage, or a prompt.
- Rate-limit by guest session/IP at the reverse proxy and application boundary; cap message size, concurrent sessions, turns, provider timeout, and token spend.
- Treat visitor input, retrieved content, and model output as untrusted; do not render generated HTML unsanitized or let the model choose broad Odoo actions.
- Ask for consent before lead creation, minimize PII, prevent duplicate leads, define transcript retention, and publish a privacy notice covering AI/provider processing.
- Production Live Chat must route `/websocket/` to the dedicated Live Chat/gevent worker behind a proxy. [Odoo on-premise deployment](https://www.odoo.com/documentation/19.0/administration/on_premise/deploy.html)

## 7. Proposed project structure

Evolve the current addon instead of rebuilding it. The following is a target shape, not an instruction to create every folder immediately:

```text
website_vorevia/
├── __manifest__.py
├── controllers/                         # only if a protected custom endpoint is justified
│   └── chat.py                          # future, not needed for native Live Chat
├── data/
│   ├── website_form_data.xml
│   └── website_defaults.xml             # optional metadata/defaults
├── models/
│   └── consultation.py
├── static/src/
│   ├── img/{content,illustrations}/
│   ├── js/
│   │   ├── homepage.js                  # current progressive interaction
│   │   ├── interactions/                # small public Interaction classes
│   │   └── components/                  # only genuine Owl islands, each .js + .xml
│   ├── scss/
│   │   ├── _tokens.scss
│   │   ├── _components.scss
│   │   └── theme.scss                   # one canonical home for theme rules
│   ├── snippets/                        # reusable public markup/templates
│   └── website_builder/                 # editor-only options, when required
└── views/
    ├── homepage.xml
    ├── layout.xml                       # scoped layout extensions, if split later
    └── snippets/vorevia_snippets.xml
```

Keep static client code in `web.assets_frontend`. Add `website.website_builder_assets` only for edit-mode options/plugins, not public behavior. Keep an Owl component's JS/XML together and mount it from a QWeb `<owl-component>` only when its state/lifecycle benefit is clear.

## 8. Dependencies and compatibility

There are **no mandatory new third-party dependencies** for the recommended architecture.

| Dependency / technology | Status | Purpose | License / compatibility position |
|---|---|---|---|
| Odoo 19 Website, QWeb, SCSS, native ES modules, Bootstrap provided by Odoo | Use | Core site implementation | Existing Odoo stack; documented Odoo 19 support |
| Odoo Owl | Conditional | Isolated stateful islands only | Existing Odoo framework; documented public-component integration in Odoo 19 |
| Browser CSS + IntersectionObserver | Use | Motion/micro-interactions and lazy/reveal behavior | Platform API; no package/license |
| `gsap` + ScrollTrigger | Optional, local bundle only | One or two complex scroll sequences | Current GSAP project states commercial use is free under its standard license; pin/review terms at adoption. It has no special Odoo 19 certification, but is ordinary ES-module code carried by Odoo's asset pipeline. [GSAP README/license link](https://github.com/greensock/GSAP/blob/master/README.md) |
| `@lottiefiles/dotlottie-web` / `.lottie` assets | Optional, deferred | A compact, art-directed illustrative animation only | dotLottie player is listed by its project; verify player version/license and every animation asset's separate usage rights before adoption. No Odoo-specific certification. [dotLottie tools](https://www.dotlottie.io/tools/) |
| Three.js | Do not adopt now | 3D only if later justified | MIT, but rejected on performance/fallback/accessibility grounds, not license |
| React / Next.js / smooth scroll package | Do not adopt | N/A | Adds unnecessary runtime/deployment/editor risk |

For native AI, the relevant external cost/dependency is an approved model provider account and server-side credential policy, not a browser package. Odoo documents AI provider configuration separately; confirm the exact offer/version at implementation time because AI product terms and provider support evolve. [AI documentation](https://www.odoo.com/documentation/19.0/applications/productivity/ai.html)

## 9. Implementation roadmap

1. **Baseline and cleanup approval.** Confirm a running staging database, capture mobile/desktop/keyboard/CWV baseline, then consolidate duplicated hero CSS into one SCSS source and decide whether the global header/footer override should become a narrower extension. Do not delete backups or images until ownership is confirmed.
2. **Builder-aware component model.** Preserve the current homepage. Extract only repeating editorial blocks into a small snippet library; document which fields an editor may change. Add editor options only where a real content-management need exists.
3. **Interactive showcase.** Keep the present semantic HTML/Interaction implementation; test tabs with keyboard, screen reader, mobile horizontal flow, edit mode, and no-JS/static reading. Use Owl only if the planned content becomes genuinely stateful.
4. **Motion prototype.** Start with CSS and IntersectionObserver. Prototype one workflow/process sequence; approve GSAP only if it demonstrates a real storytelling gain within mobile and performance budgets. Add visual regression and reduced-motion checks.
5. **Chatbot baseline.** Confirm Live Chat, CRM, Helpdesk and (if applicable) Enterprise AI module status in the target database. Configure URL/channel rule, scripted qualification, operator coverage, lead ownership, consent text, transcript retention, websocket/proxy routing, and abuse controls.
6. **AI decision gate.** If Enterprise AI is enabled and governance is approved, load only curated public sources, define escalation/lead workflows, set cost/rate caps and red-team test prompt injection. Otherwise retain scripted chat with human follow-up.
7. **Quality gates.** Test responsive layouts, touch targets, keyboard/focus, contrast, translation, form error/success states, SEO title/meta/canonical/sitemap, image sizing, LCP/CLS/INP, cookie/privacy requirements, and Website Builder editing after each upgrade.

## 10. Final technical decision

- **Should this website use React?** No. It creates complexity without a compensating capability for this Odoo-hosted, content-led company website.
- **Should it use Owl?** Yes, selectively, only for contained stateful islands. The current homepage interaction does not need an Owl rewrite.
- **Which languages should be used?** Python, XML/QWeb, SCSS/CSS and modern JavaScript modules—the native Odoo 19 stack already present.
- **Which animation libraries should be used?** CSS and IntersectionObserver by default; optionally GSAP + ScrollTrigger for a small number of validated, lazily loaded narratives. Use SVG first; dotLottie only for a justified lightweight asset. Avoid Three.js and global smooth scrolling for now.
- **How should the chatbot be implemented?** Native Odoo Live Chat with a scripted qualification flow and human/CRM handoff; enable the integrated Enterprise AI agent only after module, licensing, provider, data-source and safety verification.
- **Should everything remain within the existing Odoo 19 installation?** Yes. The site and chatbot should stay in the existing Odoo deployment; no separate React/Next app is warranted.
- **First three priorities:** (1) establish a running staging baseline and remove CSS duplication after approval; (2) evolve reusable QWeb snippets while preserving the current homepage; (3) validate/configure native Live Chat and its CRM/human-handoff policy before considering AI.

