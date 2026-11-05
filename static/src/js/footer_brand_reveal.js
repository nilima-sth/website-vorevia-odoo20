import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

export class VoreviaFooterBrandReveal extends Interaction {
    static selector = "[data-vov-brand-reveal]";

    start() {
        const document = this.el.ownerDocument;
        const isEditing = document.body.classList.contains("editor_enable");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const spacer = this.el.nextElementSibling;

        // In the editor and without the scroll APIs, the artwork stays in flow.
        if (isEditing || reducedMotion || !("IntersectionObserver" in window) ||
            !spacer?.classList.contains("vov-brand-reveal__spacer")) {
            return;
        }

        this.el.classList.add("is-enhanced");
        const observer = new IntersectionObserver(
            (entries) => {
                this.el.classList.toggle("is-visible", entries.some((entry) => entry.isIntersecting));
            },
            { threshold: 0 }
        );
        observer.observe(spacer);
        this.registerCleanup(() => observer.disconnect());
    }
}

registry.category("public.interactions").add("website_vorevia.footer_brand_reveal", VoreviaFooterBrandReveal);
