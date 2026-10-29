import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

export class VoreviaHomepage extends Interaction {
    static selector = ".o_vorevia_homepage";

    setup() {
        this.showcaseIndex = 0;
        this.processIndex = 0;
        this.showcasePaused = false;
        this.showcaseManual = false;
        this.showcaseTimer = null;
        this.showcaseHideTimer = null;
        this.processHideTimer = null;
        this.processManualUntil = 0;
        this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    start() {
        this.isEditing =
            this.el.ownerDocument.documentElement.dataset.editable === "1" ||
            this.el.ownerDocument.body.classList.contains("editor_enable");

        this.showcase = this.el.querySelector("[data-vov-showcase]");
        this.showcaseTabs = [...this.el.querySelectorAll("[data-showcase-target]")];
        this.showcasePanels = [...this.el.querySelectorAll("[data-showcase-panel]")];
        this.process = this.el.querySelector("[data-vov-process]");
        this.processTabs = [...this.el.querySelectorAll("[data-process-target]")];
        this.processPanels = [...this.el.querySelectorAll("[data-process-panel]")];

        if (this.isEditing) {
            this.el.classList.add("vov-is-editing");
            [...this.showcasePanels, ...this.processPanels].forEach((panel) => {
                panel.hidden = false;
                panel.setAttribute("aria-hidden", "false");
            });
            return;
        }

        this.showcaseTabs.forEach((tab) => {
            this.addListener(tab, "click", this.onShowcaseClick.bind(this));
            this.addListener(tab, "keydown", this.onShowcaseKeydown.bind(this));
        });
        if (this.showcase) {
            this.addListener(this.showcase, "mouseenter", () => {
                this.showcasePaused = true;
            });
            this.addListener(this.showcase, "mouseleave", () => {
                this.showcasePaused = false;
                this.scheduleShowcase();
            });
            this.addListener(this.showcase, "focusin", () => {
                this.showcasePaused = true;
            });
            this.addListener(this.showcase, "focusout", (event) => {
                if (!this.showcase.contains(event.relatedTarget)) {
                    this.showcasePaused = false;
                    this.scheduleShowcase();
                }
            });
        }

        this.processTabs.forEach((tab) => {
            this.addListener(tab, "click", this.onProcessClick.bind(this));
            this.addListener(tab, "keydown", this.onProcessKeydown.bind(this));
        });

        this.activateShowcase(0, false);
        this.activateProcess(0, false);
        this.initializeProcessObserver();
        this.initializeRevealObserver();

        if (!this.reducedMotion) {
            this.scheduleShowcase();
        }

        this.registerCleanup(() => {
            clearTimeout(this.showcaseTimer);
            clearTimeout(this.showcaseHideTimer);
            clearTimeout(this.processHideTimer);
            this.processObserver?.disconnect();
            this.revealObserver?.disconnect();
        });
    }

    onShowcaseClick(event) {
        const index = this.showcaseTabs.indexOf(event.currentTarget);
        if (index < 0) {
            return;
        }
        this.showcaseManual = true;
        clearTimeout(this.showcaseTimer);
        this.activateShowcase(index, true);
    }

    onShowcaseKeydown(event) {
        const current = this.showcaseTabs.indexOf(event.currentTarget);
        const last = this.showcaseTabs.length - 1;
        let next = current;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) {
            next = current === last ? 0 : current + 1;
        } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
            next = current === 0 ? last : current - 1;
        } else if (event.key === "Home") {
            next = 0;
        } else if (event.key === "End") {
            next = last;
        } else {
            return;
        }
        event.preventDefault();
        this.showcaseManual = true;
        clearTimeout(this.showcaseTimer);
        this.activateShowcase(next, true);
        this.showcaseTabs[next].focus();
    }

    activateShowcase(index, animate = true) {
        if (!this.showcaseTabs.length || !this.showcasePanels.length) {
            return;
        }
        this.showcaseIndex = index;
        const key = this.showcaseTabs[index].dataset.showcaseTarget;
        const targetPanel = this.showcasePanels.find((panel) => panel.dataset.showcasePanel === key);
        if (!targetPanel) {
            return;
        }

        this.showcaseTabs.forEach((tab, tabIndex) => {
            const active = tabIndex === index;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        clearTimeout(this.showcaseHideTimer);
        this.showcasePanels.forEach((panel) => {
            if (panel !== targetPanel) {
                panel.classList.remove("is-active");
                panel.setAttribute("aria-hidden", "true");
            }
        });

        targetPanel.hidden = false;
        targetPanel.setAttribute("aria-hidden", "false");
        if (animate && !this.reducedMotion) {
            targetPanel.classList.remove("is-active");
            void targetPanel.offsetWidth;
        }
        targetPanel.classList.add("is-active");

        this.showcaseHideTimer = this.waitForTimeout(() => {
            this.showcasePanels.forEach((panel) => {
                if (panel !== targetPanel) {
                    panel.hidden = true;
                }
            });
        }, animate && !this.reducedMotion ? 260 : 0);
    }

    scheduleShowcase() {
        clearTimeout(this.showcaseTimer);
        if (this.showcaseManual || this.reducedMotion || !this.showcaseTabs.length) {
            return;
        }
        this.showcaseTimer = this.waitForTimeout(() => {
            if (!this.showcasePaused) {
                this.activateShowcase((this.showcaseIndex + 1) % this.showcaseTabs.length, true);
            }
            this.scheduleShowcase();
        }, 7000);
    }

    onProcessClick(event) {
        const index = this.processTabs.indexOf(event.currentTarget);
        if (index < 0) {
            return;
        }
        this.processManualUntil = Date.now() + 1500;
        this.activateProcess(index, true);
    }

    onProcessKeydown(event) {
        const current = this.processTabs.indexOf(event.currentTarget);
        const last = this.processTabs.length - 1;
        let next = current;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) {
            next = current === last ? 0 : current + 1;
        } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
            next = current === 0 ? last : current - 1;
        } else if (event.key === "Home") {
            next = 0;
        } else if (event.key === "End") {
            next = last;
        } else {
            return;
        }
        event.preventDefault();
        this.processManualUntil = Date.now() + 1500;
        this.activateProcess(next, true);
        this.processTabs[next].focus();
    }

    activateProcess(index, animate = true) {
        if (!this.processTabs.length || !this.processPanels.length || index === this.processIndex && animate) {
            return;
        }
        this.processIndex = index;
        const key = this.processTabs[index].dataset.processTarget;
        const targetPanel = this.processPanels.find((panel) => panel.dataset.processPanel === key);
        if (!targetPanel) {
            return;
        }

        this.processTabs.forEach((tab, tabIndex) => {
            const active = tabIndex === index;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        clearTimeout(this.processHideTimer);
        this.processPanels.forEach((panel) => {
            if (panel !== targetPanel) {
                panel.classList.remove("is-active");
                panel.setAttribute("aria-hidden", "true");
            }
        });
        targetPanel.hidden = false;
        targetPanel.setAttribute("aria-hidden", "false");
        if (animate && !this.reducedMotion) {
            targetPanel.classList.remove("is-active");
            void targetPanel.offsetWidth;
        }
        targetPanel.classList.add("is-active");

        this.processHideTimer = this.waitForTimeout(() => {
            this.processPanels.forEach((panel) => {
                if (panel !== targetPanel) {
                    panel.hidden = true;
                }
            });
        }, animate && !this.reducedMotion ? 260 : 0);
    }

    initializeProcessObserver() {
        if (!("IntersectionObserver" in window) || this.reducedMotion || !this.processTabs.length) {
            return;
        }
        this.processObserver = new IntersectionObserver(
            (entries) => {
                if (Date.now() < this.processManualUntil) {
                    return;
                }
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (!visible) {
                    return;
                }
                const index = this.processTabs.indexOf(visible.target);
                if (index >= 0 && index !== this.processIndex) {
                    this.activateProcess(index, true);
                }
            },
            { rootMargin: "-34% 0px -34% 0px", threshold: [0.2, 0.45, 0.7] }
        );
        this.processTabs.forEach((tab) => this.processObserver.observe(tab));
    }

    initializeRevealObserver() {
        const sections = [...this.el.querySelectorAll(".vov-section, .vov-final-cta")];
        if (this.reducedMotion || !("IntersectionObserver" in window)) {
            sections.forEach((section) => section.classList.add("is-revealed"));
            return;
        }
        sections.forEach((section) => section.classList.add("vov-reveal"));
        this.revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-revealed");
                        this.revealObserver.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
        );
        sections.forEach((section) => this.revealObserver.observe(section));
    }
}

registry.category("public.interactions").add("website_vorevia.homepage", VoreviaHomepage);
