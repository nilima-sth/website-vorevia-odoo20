import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

// Without JavaScript (or in the Odoo editor), the complete paragraph remains visible.
export class VoreviaAboutReadMore extends Interaction {
    static selector = "[data-vov-about-expand]";

    start() {
        if (this.el.ownerDocument.body.classList.contains("editor_enable")) return;
        const more = this.el.querySelector("[data-vov-about-more]");
        const button = this.el.querySelector("[data-vov-about-toggle]");
        const label = this.el.querySelector("[data-vov-about-toggle-text]");
        const section = this.el.closest(".vov-about-identity");
        if (!more || !button || !label) return;

        more.hidden = true;
        button.hidden = false;
        this.addListener(button, "click", () => {
            const expanded = button.getAttribute("aria-expanded") !== "true";
            more.hidden = !expanded;
            button.setAttribute("aria-expanded", String(expanded));
            label.textContent = expanded ? "See Less" : "See More";
            section?.classList.toggle("is-expanded", expanded);

            if (!expanded && section) {
                window.requestAnimationFrame(() => {
                    section.scrollIntoView({
                        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                        block: "start",
                    });
                });
            }
        });
    }
}

registry.category("public.interactions").add("website_vorevia.about_read_more", VoreviaAboutReadMore);
