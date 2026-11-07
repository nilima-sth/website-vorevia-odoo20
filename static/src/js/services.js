import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";


export class VoreviaServices extends Interaction {
    static selector = ".vov-services-page";

    start() {
        this.tabs = [...this.el.querySelectorAll("[data-service-target]")];
        this.panels = [...this.el.querySelectorAll("[data-service-panel]")];
        this.tabs.forEach((tab) => {
            this.addListener(tab, "click", () => this.activate(tab));
            this.addListener(tab, "keydown", (event) => this.onKeydown(event));
        });
    }

    activate(activeTab, focus = false) {
        const key = activeTab.dataset.serviceTarget;
        this.tabs.forEach((tab) => {
            const active = tab === activeTab;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        this.panels.forEach((panel) => {
            const active = panel.dataset.servicePanel === key;
            panel.classList.toggle("is-active", active);
            panel.hidden = !active;
        });
        if (focus) {
            activeTab.focus();
        }
    }

    onKeydown(event) {
        const current = this.tabs.indexOf(event.currentTarget);
        let next = current;
        if (["ArrowDown", "ArrowRight"].includes(event.key)) {
            next = (current + 1) % this.tabs.length;
        } else if (["ArrowUp", "ArrowLeft"].includes(event.key)) {
            next = (current - 1 + this.tabs.length) % this.tabs.length;
        } else if (event.key === "Home") {
            next = 0;
        } else if (event.key === "End") {
            next = this.tabs.length - 1;
        } else {
            return;
        }
        event.preventDefault();
        this.activate(this.tabs[next], true);
    }
}

registry.category("public.interactions").add("website_vorevia.services", VoreviaServices);
