# Vorevia Homepage Design QA

## Comparison target

- Primary current visual asset: `/home/nilima/Downloads/tablet_image_homepage.webp`.
- Supporting direction: the user's Novus hero screenshot and request for a clean, unboxed product visual.
- Implementation URL: `http://localhost:8069/`, database `website_vorevia`.
- Intended viewports: 1440px desktop, 1280px laptop, 768px tablet, and 390px mobile.
- Required state coverage: simplified hero, four module showcase tabs, five process stages, FAQ states, mobile navigation, reduced motion, and Website Builder edit mode.

## Full-view comparison evidence

Browser capture is unavailable in this session. Browser setup completed, but discovery returned no available browser surfaces. A valid full-page screenshot comparison therefore could not be produced.

## Focused-region comparison evidence

Blocked for the same reason. The supplied tablet image was inspected directly and copied byte-for-byte into the module. The rendered hero composition, typography, image scale, mobile overflow, and button radius still require browser screenshots before visual fidelity can be certified.

## Static and runtime evidence completed

- The Odoo module upgraded successfully after the redesign and again after adding the consultation model.
- XML parses successfully: 53 source IDs, all unique.
- All 15 `aria-controls` and 14 `aria-labelledby` references resolve to existing IDs.
- The desktop and mobile Contact navigation items are absent; the rounded Let's Talk CTA remains the consultation path.
- The hero now contains only the supplied tablet image. The outer workspace box, module tabs, status strip, and floating Sales/Inventory/CRM/Invoicing cards are absent from rendered HTML.
- Main module showcase: four tabs and four panels.
- Implementation process: five tabs and five panels (Discover, Configure, Customize, Deploy, Support).
- Solutions by Industry: Retail, Manufacturing, Distribution, and Service businesses.
- Contact: a database-backed consultation model, admin list/form views, and Website form whitelist.
- Controlled form test passed on a freshly started temporary Odoo worker: HTTP 200, `{"id": 1}`, fields stored correctly, and the synthetic record removed afterward.
- The public homepage returns HTTP 200 once the database session is selected.
- Production frontend CSS, minimal JavaScript, and lazy JavaScript bundles all return HTTP 200.
- Hero-specific demo JavaScript and data attributes are absent.
- Production frontend CSS, minimal JavaScript, and lazy JavaScript bundles return HTTP 200 after the update.
- The live QWeb output contains the 12px Let's Talk radius and responsive standalone-image rules; these provide immediate styling until the next normal service restart refreshes the worker's SCSS source cache.
- The served tablet asset SHA-256 matches the source: `ded8a5a34545c4e245a7f73b106faca8ad30b423873b583363b5e209fcdf9c01`.
- Python modules compile successfully.

## Findings

- [P0 verification blocker] Browser-rendered comparison is unavailable.
  - Evidence: browser discovery returned an empty browser list.
  - Impact: pixel-level visual quality, responsive overflow, interactive transitions, console behavior, and Website Builder rendering cannot be certified from screenshots.
  - Required follow-up: attach a supported browser and capture all four target widths plus every interactive state.

- [P0 deployment action] The production `odoo19` process must be restarted once.
  - Evidence: the service account reloaded database metadata after module upgrade, but the already-running Python process cannot import the newly added `vorevia.consultation` model. A production form POST therefore currently raises `KeyError: 'vorevia.consultation'`.
  - Validation: the same form passed end-to-end on a fresh temporary Odoo process.
  - Required follow-up: an administrator runs `sudo systemctl restart odoo19`; no further module upgrade is required.

## Required visual follow-up

- Capture desktop, laptop, tablet, and mobile views.
- Check the standalone tablet scale and spacing against the supplied reference.
- Exercise the four module showcase states and five process stages.
- Check mobile navigation, FAQ controls, reduced motion, and Website Builder edit mode.
- Inspect the browser console and fix any visual or runtime findings.

final result: blocked
