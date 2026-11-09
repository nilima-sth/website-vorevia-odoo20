import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";
import { setupMobileStepper } from "./mobile_stepper";

export class VoreviaWhyStory extends Interaction {
    static selector = "[data-vov-why-story]";

    start() {
        if (this.el.ownerDocument.body.classList.contains("editor_enable")) return;

        this.tabs = [...this.el.querySelectorAll("[data-vov-why-tab]")];
        this.panels = new Map([...this.el.querySelectorAll("[data-vov-why-panel]")]
            .map((panel) => [panel.dataset.vovWhyPanel, panel]));
        this.hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 992px)");

        for (const tab of this.tabs) {
            const select = () => this.select(tab.dataset.vovWhyTab);
            this.addListener(tab, "pointerenter", () => {
                if (this.hoverQuery.matches) select();
            });
            this.addListener(tab, "focus", select);
            this.addListener(tab, "click", select);
            this.addListener(tab, "keydown", (event) => this.onKeydown(event, tab));
        }
        this.syncMobile = setupMobileStepper(
            this, this.el, this.tabs,
            (index) => this.select(this.tabs[index].dataset.vovWhyTab),
            (tab) => ({
                title: tab.querySelector(".vov-why-step__copy small")?.textContent.trim(),
                subtitle: tab.querySelector(".vov-why-step__copy strong")?.textContent.trim(),
            })
        );
        this.select("understand");
    }

    select(name) {
        if (!this.panels.has(name)) return;
        for (const tab of this.tabs) {
            const active = tab.dataset.vovWhyTab === name;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        }
        for (const [key, panel] of this.panels) {
            panel.hidden = key !== name;
            panel.classList.toggle("is-active", key === name);
        }
        this.syncMobile?.(this.tabs.findIndex((tab) => tab.dataset.vovWhyTab === name));
    }

    onKeydown(event, tab) {
        const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const index = this.tabs.indexOf(tab);
        const next = event.key === "Home" ? 0 : event.key === "End" ? this.tabs.length - 1
            : (index + (event.key === "ArrowDown" ? 1 : -1) + this.tabs.length) % this.tabs.length;
        this.tabs[next].focus();
    }
}

registry.category("public.interactions").add("website_vorevia.why_story", VoreviaWhyStory);
