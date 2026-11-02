import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

const CLOSE_DELAY = 190;
const EXIT_DURATION = 210;

export class VoreviaNavigationMenus extends Interaction {
    static selector = ".vov-site-header";

    setup() {
        this.activeMenu = null;
        this.closeTimer = null;
        this.hideTimers = new Map();
        this.desktopQuery = window.matchMedia("(min-width: 992px)");
        this.hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
        this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    }

    start() {
        const doc = this.el.ownerDocument;
        if (doc.documentElement.dataset.editable === "1" || doc.body.classList.contains("editor_enable")) {
            return;
        }

        this.triggers = new Map([...this.el.querySelectorAll("[data-mega-trigger]")]
            .map((element) => [element.dataset.megaTrigger, element]));
        this.panels = new Map([...this.el.querySelectorAll("[data-mega-panel]")]
            .map((element) => [element.dataset.megaPanel, element]));

        for (const [name, trigger] of this.triggers) {
            const panel = this.panels.get(name);
            if (!panel) continue;

            this.addListener(trigger, "pointerenter", (event) => {
                if (this.desktopQuery.matches && event.pointerType !== "touch") this._open(name);
            });
            this.addListener(trigger, "pointerleave", () => this._scheduleClose());
            this.addListener(trigger, "click", (event) => {
                if (this.desktopQuery.matches && !this.hoverQuery.matches) {
                    event.preventDefault();
                    this.activeMenu === name ? this._close() : this._open(name);
                }
            });
            this.addListener(trigger, "keydown", (event) => this._onTriggerKeydown(event, name));
            this.addListener(panel, "pointerenter", () => this._cancelClose());
            this.addListener(panel, "pointerleave", () => this._scheduleClose());
        }

        this.addListener(this.el, "focusout", (event) => {
            if (!this.activeMenu) return;
            const trigger = this.triggers.get(this.activeMenu);
            const panel = this.panels.get(this.activeMenu);
            const next = event.relatedTarget;
            if (next && !trigger.contains(next) && !panel.contains(next)) this._close();
        });
        this.addListener(doc, "pointerdown", (event) => {
            if (this.activeMenu && !this.el.contains(event.target)) this._close();
        });
        this.addListener(doc, "keydown", (event) => {
            if (event.key !== "Escape") return;
            if (this.activeMenu) {
                const trigger = this.triggers.get(this.activeMenu);
                this._close();
                trigger.focus();
                event.preventDefault();
                return;
            }
            for (const [name, toggle] of this.mobileToggles) {
                if (toggle.getAttribute("aria-expanded") === "true") {
                    this._toggleMobile(name);
                    toggle.focus();
                    event.preventDefault();
                    break;
                }
            }
        });
        this.addListener(this.desktopQuery, "change", () => {
            this._close(true);
            if (this.desktopQuery.matches) {
                const mobileToggle = this.el.querySelector(".vov-menu-toggle");
                if (mobileToggle?.getAttribute("aria-expanded") === "true") mobileToggle.click();
                for (const [name, toggle] of this.mobileToggles) {
                    if (toggle.getAttribute("aria-expanded") === "true") this._toggleMobile(name);
                }
            }
        });

        this.serviceTabs = [...this.el.querySelectorAll("[data-service-tab]")];
        this.servicePanels = new Map([...this.el.querySelectorAll("[data-service-panel]")]
            .map((element) => [element.dataset.servicePanel, element]));
        for (const tab of this.serviceTabs) {
            const activate = () => this._selectService(tab.dataset.serviceTab);
            this.addListener(tab, "pointerenter", (event) => {
                if (event.pointerType !== "touch") activate();
            });
            this.addListener(tab, "focus", activate);
            this.addListener(tab, "click", activate);
            this.addListener(tab, "keydown", (event) => this._onServiceKeydown(event, tab));
        }
        this._selectService("implementation");

        this.mobileToggles = new Map([...this.el.querySelectorAll("[data-mega-mobile-toggle]")]
            .map((element) => [element.dataset.megaMobileToggle, element]));
        this.mobileContents = new Map([...this.el.querySelectorAll("[data-mega-mobile-content]")]
            .map((element) => [element.dataset.megaMobileContent, element]));
        for (const [name, toggle] of this.mobileToggles) {
            this.addListener(toggle, "click", () => this._toggleMobile(name));
        }

        this.registerCleanup(() => {
            this._cancelClose();
            for (const timer of this.hideTimers.values()) clearTimeout(timer);
        });
    }

    _open(name) {
        if (!this.desktopQuery.matches) return;
        this._cancelClose();
        if (this.activeMenu === name) return;

        if (this.activeMenu) {
            const previousPanel = this.panels.get(this.activeMenu);
            previousPanel.classList.remove("is-open");
            previousPanel.hidden = true;
            this.triggers.get(this.activeMenu).setAttribute("aria-expanded", "false");
        }

        const panel = this.panels.get(name);
        clearTimeout(this.hideTimers.get(name));
        panel.hidden = false;
        this.activeMenu = name;
        this.triggers.get(name).setAttribute("aria-expanded", "true");
        void panel.offsetWidth;
        panel.classList.add("is-open");
    }

    _close(immediate = false) {
        this._cancelClose();
        if (!this.activeMenu) return;
        const name = this.activeMenu;
        const panel = this.panels.get(name);
        panel.classList.remove("is-open");
        this.triggers.get(name).setAttribute("aria-expanded", "false");
        this.activeMenu = null;
        const hide = () => { if (this.activeMenu !== name) panel.hidden = true; };
        if (immediate || this.reducedMotion.matches) hide();
        else this.hideTimers.set(name, setTimeout(hide, EXIT_DURATION));
    }

    _scheduleClose() {
        this._cancelClose();
        if (this.activeMenu) this.closeTimer = setTimeout(() => this._close(), CLOSE_DELAY);
    }

    _cancelClose() {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
    }

    _onTriggerKeydown(event, name) {
        if (event.key === "ArrowDown" || event.key === " ") {
            event.preventDefault();
            this._open(name);
            const first = this.panels.get(name).querySelector("[data-service-tab], a");
            first?.focus();
        }
    }

    _selectService(name) {
        for (const tab of this.serviceTabs) {
            const selected = tab.dataset.serviceTab === name;
            tab.classList.toggle("is-active", selected);
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
        }
        for (const [key, panel] of this.servicePanels) {
            panel.hidden = key !== name;
        }
    }

    _onServiceKeydown(event, tab) {
        const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const index = this.serviceTabs.indexOf(tab);
        const next = event.key === "Home" ? 0 : event.key === "End" ? this.serviceTabs.length - 1
            : (index + (event.key === "ArrowDown" ? 1 : -1) + this.serviceTabs.length) % this.serviceTabs.length;
        this.serviceTabs[next].focus();
    }

    _toggleMobile(name) {
        const toggle = this.mobileToggles.get(name);
        const content = this.mobileContents.get(name);
        if (!toggle || !content) return;
        const opening = toggle.getAttribute("aria-expanded") !== "true";
        for (const [otherName, otherToggle] of this.mobileToggles) {
            const otherContent = this.mobileContents.get(otherName);
            const expanded = opening && otherName === name;
            otherToggle.setAttribute("aria-expanded", String(expanded));
            otherContent.hidden = !expanded;
            otherContent.classList.toggle("is-open", expanded);
        }
    }
}

registry.category("public.interactions").add("website_vorevia.navigation_menus", VoreviaNavigationMenus);
