"""Generate the illustrative, resolution-independent homepage workspace images."""

from html import escape
from pathlib import Path


OUTPUT = Path(__file__).resolve().parents[1] / "static/src/img/workspaces"
OUTPUT.mkdir(parents=True, exist_ok=True)

INK = "#17212b"
MUTED = "#617180"
BLUE = "#286fbd"
PALE = "#edf6fc"
LINE = "#d7e4ed"
GREEN = "#347e69"


class SVG:
    def __init__(self, width, height, title):
        self.width = width
        self.height = height
        self.parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
            f'viewBox="0 0 {width} {height}" role="img" aria-label="{escape(title, quote=True)}">',
            f'<title>{escape(title)}</title>',
            '<rect width="100%" height="100%" fill="#ffffff"/>',
        ]

    def rect(self, x, y, w, h, fill="white", stroke=LINE, radius=0, sw=1):
        self.parts.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
        )

    def line(self, x1, y1, x2, y2, color=LINE, sw=1):
        self.parts.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}"/>'
        )

    def circle(self, cx, cy, r, fill=BLUE):
        self.parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>')

    def text(self, x, y, value, size=14, weight=400, fill=INK, anchor="start", spacing=0):
        self.parts.append(
            f'<text x="{x}" y="{y}" font-family="Arial,Helvetica,sans-serif" '
            f'font-size="{size}" font-weight="{weight}" fill="{fill}" '
            f'text-anchor="{anchor}" letter-spacing="{spacing}">{escape(value)}</text>'
        )

    def lines(self, x, y, values, size=14, weight=400, fill=INK, leading=22):
        for index, value in enumerate(values):
            self.text(x, y + index * leading, value, size, weight, fill)

    def save(self, name):
        (OUTPUT / name).write_text("".join(self.parts) + "</svg>\n", encoding="utf-8")


def heading(svg, eyebrow, title, compact=False):
    x = 30 if compact else 48
    svg.text(x, 48 if compact else 62, eyebrow, 10, 800, BLUE, spacing=1.5)
    if isinstance(title, str):
        title = [title]
    title_size = 23 if compact else (27 if len(title[0]) > 35 else 30)
    svg.lines(x, 78 if compact else 103, title, title_size, 700, INK, 29 if compact else 35)
    if not compact:
        svg.text(svg.width - 48, 62, "Illustrative data", 11, 400, MUTED, "end")
    svg.line(x, 132 if compact else 151, svg.width - x, 132 if compact else 151)


def labeled_card(svg, x, y, w, h, label, main, detail, active=False, compact=False):
    svg.rect(x, y, w, h, PALE if active else "#ffffff", "#a9cde8" if active else LINE, 7)
    svg.rect(x + 15, y + 17, 8, 8, BLUE if active else "#90a8b9", "none", 2)
    svg.text(x + 32, y + 25, label.upper(), 9 if compact else 10, 800, MUTED, spacing=0.8)
    svg.text(x + 16, y + 52, main, 14 if compact else 16, 700)
    if detail:
        svg.text(x + 16, y + 73, detail, 10 if compact else 11, 400, MUTED)


def table(svg, x, y, widths, headers, rows, row_height=51):
    total = sum(widths)
    svg.rect(x, y, total, 41 + len(rows) * row_height, "#ffffff", LINE, 4)
    svg.rect(x, y, total, 41, "#f3f7fa", "none", 4)
    offset = x
    for width, header in zip(widths, headers):
        svg.text(offset + 14, y + 26, header.upper(), 9, 800, MUTED, spacing=0.4)
        offset += width
    svg.line(x, y + 41, x + total, y + 41)
    for row_index, row in enumerate(rows):
        top = y + 41 + row_index * row_height
        if row_index:
            svg.line(x, top, x + total, top)
        offset = x
        for col_index, (width, value) in enumerate(zip(widths, row)):
            color = GREEN if col_index == len(row) - 1 and value in ("Available", "Ready", "Done") else INK
            svg.text(offset + 14, top + 31, value, 11, 700 if col_index in (0, len(row) - 1) else 400, color)
            offset += width


SHOWCASES = {
    "sales": {
        "eyebrow": "SALES WORKSPACE", "title": "Opportunity to order",
        "mobile_title": ["Opportunity to", "order"],
        "cards": [("Open pipeline", "12 opportunities", "Across 3 stages"), ("Next action", "Review quotation", "Today, 2:30 PM")],
        "rows": [("Qualified", "3", "Discovery complete"), ("Quotation", "2", "Quotation ready"), ("Won", "7", "Order confirmed")],
    },
    "inventory": {
        "eyebrow": "INVENTORY WORKSPACE", "title": "Confirmed demand becomes stock movement",
        "mobile_title": ["Demand becomes", "stock movement"],
        "cards": [("Sales order", "SO-1042", "Confirmed"), ("Reservation", "2 units ready", "Stock allocated"), ("Delivery", "Waiting", "Next handoff")],
        "rows": [("Assembly A", "18", "2", "Available"), ("Component B", "42", "6", "Available"), ("Kit C", "7", "4", "Review")],
    },
    "accounting": {
        "eyebrow": "ACCOUNTING WORKSPACE", "title": "Operational activity meets financial context",
        "mobile_title": ["Activity meets", "financial context"],
        "cards": [("Draft invoice", "INV/2026/1042", "Related order SO-1042"), ("Invoice basis", "Delivered items", "Ready for review")],
        "rows": [("Sale", "Confirmed", "Source linked"), ("Delivery", "Recorded", "Source linked"), ("Receivable", "Prepared", "Ready for review")],
    },
    "hr": {
        "eyebrow": "PEOPLE WORKSPACE", "title": "Employee planning in one clear view",
        "mobile_title": ["Employee planning", "in one view"],
        "cards": [("Today", "Team availability", "12 active · 2 on leave"), ("Requests", "3 to review", "Leave and attendance")],
        "rows": [("Alex M.", "Mon–Thu", "Fri leave"), ("Sara K.", "Mon–Wed", "Thu–Fri leave"), ("Ravi P.", "Mon–Fri", "Available")],
    },
    "manufacturing": {
        "eyebrow": "MANUFACTURING WORKSPACE", "title": "From materials to finished goods",
        "mobile_title": ["Materials to", "finished goods"],
        "cards": [("Demand", "MO-1042", "Production planned"), ("Work order", "Assembly", "In progress"), ("Quality", "Final check", "Next handoff")],
        "rows": [("Materials", "Reserved", "Ready"), ("Assembly", "In progress", "On track"), ("Finished goods", "Pending", "Quality check")],
    },
}


def showcase_desktop(key, data):
    svg = SVG(800, 570, f"Illustrative {key} workspace")
    heading(svg, data["eyebrow"], data["title"])
    cards = data["cards"]
    gap = 14
    card_width = (704 - gap * (len(cards) - 1)) / len(cards)
    for index, (label, main, detail) in enumerate(cards):
        labeled_card(svg, 48 + index * (card_width + gap), 181, card_width, 104, label, main, detail, index == 1)
    if key == "inventory":
        table(svg, 48, 319, [285, 138, 135, 146], ["Product", "On hand", "Reserved", "Status"], data["rows"], 62)
    elif key == "sales":
        for index, (label, count, detail) in enumerate(data["rows"]):
            x = 48 + index * 239
            svg.rect(x, 320, 225, 200, PALE if index == 1 else "#ffffff", "#a9cde8" if index == 1 else LINE, 7)
            svg.text(x + 18, 352, label, 14, 700)
            svg.text(x + 206, 352, count, 12, 700, BLUE, "end")
            svg.line(x + 18, 369, x + 207, 369)
            svg.text(x + 18, 400, ("Northwind Retail", "Summit Foods", "Atlas Services")[index], 11, 400, MUTED)
            svg.text(x + 18, 428, ("ERP rollout", "Operations suite", "Support workflow")[index], 15, 700)
            svg.text(x + 18, 492, detail, 11, 700, BLUE)
    elif key == "accounting":
        svg.rect(48, 317, 704, 213, "#ffffff", LINE, 7)
        svg.text(68, 348, "TRANSACTION PATH", 10, 800, BLUE, spacing=1)
        for index, (step, state, detail) in enumerate(data["rows"]):
            y = 383 + index * 48
            svg.circle(78, y - 4, 5, BLUE if index < 2 else "#a7c7dc")
            if index < 2:
                svg.line(78, y + 2, 78, y + 40, "#a7c7dc", 2)
            svg.text(99, y, step, 13, 700)
            svg.text(260, y, state, 12, 700, BLUE)
            svg.text(730, y, detail, 11, 400, MUTED, "end")
    else:
        headers = ["Work item", "Stage", "Status"] if key == "manufacturing" else ["Team member", "Schedule", "Status"]
        table(svg, 48, 319, [292, 190, 222], headers, data["rows"], 62)
    svg.save(f"showcase-{key}.svg")


def showcase_mobile(key, data):
    svg = SVG(400, 620, f"Illustrative {key} workspace, mobile layout")
    heading(svg, data["eyebrow"], data["mobile_title"], compact=True)
    additional_cards = {
        "sales": [("QUOTATION", "Ready for review", "Summit Foods"), ("ORDER", "Ready to confirm", "Opportunity to order")],
        "inventory": [("STOCK STATUS", "Availability visible", "Reservation to delivery")],
        "accounting": [("DELIVERY", "Recorded", "Source transaction linked"), ("RECEIVABLE", "Prepared", "Ready for review")],
        "hr": [("SCHEDULE", "Team planning", "Availability in one view"), ("REQUEST", "3 to review", "Leave and attendance")],
        "manufacturing": [("FINISHED GOODS", "Pending", "Final quality check")],
    }[key]
    items = data["cards"] + additional_cards
    for index, (label, main, detail) in enumerate(items):
        labeled_card(svg, 30, 155 + index * 110, 340, 94, label, main, detail, index == 1, compact=True)
    svg.text(30, 598, "ILLUSTRATIVE DATA · VOREVIA TECHNOLOGIES", 9, 800, MUTED, spacing=0.7)
    svg.save(f"showcase-{key}-mobile.svg")


PROCESS = {
    "discover": ("01 / DISCOVER", "Process intelligence", [
        ("Customer request", "Entry point"), ("Current workflow", "Mapped together"),
        ("Pain points", "Evidence gathered"), ("Clear priority", "Defined outcome")
    ], ["A shared view of what the system", "must improve."]),
    "configure": ("02 / CONFIGURE", "System design", [
        ("CRM", "Stages aligned"), ("Inventory", "Routes defined"),
        ("Accounting", "Rules reviewed"), ("Access", "Roles prepared")
    ], ["A configured workspace that reflects", "the approved process."]),
    "customize": ("03 / CUSTOMIZE", "Focused extension", [
        ("Workflow logic", "Approved rules"), ("Approvals", "Clear ownership"),
        ("Integration", "Required systems"), ("Documents", "Business formats")
    ], ["Only the custom behavior needed for", "the agreed operating model."]),
    "deploy": ("04 / DEPLOY", "Go-live readiness", [
        ("Validated data", "Reviewed before migration"), ("Training", "Prepared for each team"),
        ("Go-live plan", "Owners and fallback"), ("Handover", "Ready to operate")
    ], ["A controlled deployment with teams", "ready to work."]),
    "support": ("05 / SUPPORT", "Continuous improvement", [
        ("Issue support", "Clear response path"), ("Workflow refinement", "Based on real use"),
        ("User guidance", "Practical assistance"), ("Roadmap", "Prioritized next steps")
    ], ["A system that continues to fit as", "the business evolves."]),
}


def process_image(key, data, mobile=False):
    width, height = (400, 560) if mobile else (700, 500)
    svg = SVG(width, height, f"Illustrative {key} implementation stage")
    eyebrow, descriptor, cards, outcome = data
    side = 26 if mobile else 40
    inner = width - side * 2
    svg.rect(1, 1, width - 2, height - 2, "#f8fbfd", LINE, 6)
    svg.text(side, 48, eyebrow, 11, 800, BLUE, spacing=1.2)
    svg.text(width - side, 48, descriptor, 11, 600, MUTED, "end")
    svg.line(side, 70, width - side, 70)
    gap = 12
    card_w = (inner - gap) / 2
    card_h = 139 if mobile else 125
    start_y = 91
    for index, (title, detail) in enumerate(cards):
        x = side + (index % 2) * (card_w + gap)
        y = start_y + (index // 2) * (card_h + gap)
        svg.rect(x, y, card_w, card_h, PALE if index < 2 else "#ffffff", "#9fc7e4" if index < 2 else LINE, 5)
        svg.circle(x + 23, y + 29, 8, BLUE if index < 2 else "#90b2cb")
        svg.text(x + 18, y + 65, title, 13 if mobile else 15, 700)
        if mobile and len(detail) > 25:
            detail = detail[:23] + "…"
        svg.text(x + 18, y + 90, detail, 10 if mobile else 11, 400, MUTED)
    output_y = 400 if mobile else 385
    svg.rect(side, output_y, inner, 117 if mobile else 82, "#ffffff", "#a9cde8", 5)
    svg.text(side + 18, output_y + 28, "OUTPUT", 9, 800, BLUE, spacing=1.1)
    svg.lines(side + 18, output_y + 53, outcome, 12 if mobile else 14, 700, INK, 20)
    svg.save(f"process-{key}{'-mobile' if mobile else ''}.svg")


def delivery(mobile=False):
    width, height = (400, 500) if mobile else (620, 465)
    svg = SVG(width, height, "Illustrative Vorevia delivery workspace")
    svg.rect(1, 1, width - 2, height - 2, "#ffffff", LINE, 7)
    svg.rect(1, 1, width - 2, 44, "#f9fbfc", "none", 7)
    for x in (20, 33, 46):
        svg.circle(x, 22, 3, "#cad8e2")
    svg.text(66, 27, "Vorevia delivery workspace", 11, 700, MUTED)
    svg.rect(1, 44, width - 2, 101, PALE, "none")
    svg.text(25, 76, "WORKFLOW COVERAGE", 10, 800, BLUE, spacing=1.3)
    svg.text(25, 110, "Connected from lead to ledger", 18 if mobile else 21, 700)
    svg.text(25, 133, "4 delivery stages", 11, 400, MUTED)
    rows = [("Discover", "Process mapped", "Complete"), ("Configure", "Core modules aligned", "In progress"),
            ("Integrate", "Data pathways defined", "Planned"), ("Adopt", "Role-based training", "Planned")]
    row_height = 79 if mobile else 74
    for index, (title, detail, state) in enumerate(rows):
        y = 159 + index * row_height
        svg.rect(25, y + 7, 30, 30, PALE, LINE, 4)
        svg.text(40, y + 27, str(index + 1), 12, 800, BLUE, "middle")
        svg.text(69, y + 20, title, 14, 700)
        svg.text(69, y + 41, detail, 11, 400, MUTED)
        svg.text(width - 25, y + 28, state, 11, 700, BLUE, "end")
        svg.line(25, y + 60, width - 25, y + 60)
    svg.save(f"delivery-workspace{'-mobile' if mobile else ''}.svg")


if __name__ == "__main__":
    delivery()
    delivery(mobile=True)
    for name, spec in SHOWCASES.items():
        showcase_desktop(name, spec)
        showcase_mobile(name, spec)
    for name, spec in PROCESS.items():
        process_image(name, spec)
        process_image(name, spec, mobile=True)
