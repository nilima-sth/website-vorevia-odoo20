/**
 * Progressive mobile navigation for existing tab/panel sections.
 * The original tabs remain available if frontend JS fails or the website is being edited.
 */
export function setupMobileStepper(interaction, root, tabs, selectIndex, describeTab) {
    const stepper = root?.querySelector("[data-mobile-stepper]");
    if (!stepper || !tabs.length) return () => {};

    const previous = stepper.querySelector("[data-mobile-prev]");
    const next = stepper.querySelector("[data-mobile-next]");
    const title = stepper.querySelector("[data-mobile-title]");
    const subtitle = stepper.querySelector("[data-mobile-subtitle]");
    const count = stepper.querySelector("[data-mobile-count]");
    if (!previous || !next || !title || !subtitle || !count) return () => {};

    const update = (index) => {
        const tab = tabs[index];
        if (!tab) return;
        const item = describeTab(tab);
        title.textContent = item.title || "";
        subtitle.textContent = item.subtitle || "";
        count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")}`;
    };

    const move = (delta) => {
        const active = tabs.findIndex((tab) => tab.classList.contains("is-active"));
        const index = (Math.max(0, active) + delta + tabs.length) % tabs.length;
        selectIndex(index);
    };
    interaction.addListener(previous, "click", () => move(-1));
    interaction.addListener(next, "click", () => move(1));

    update(Math.max(0, tabs.findIndex((tab) => tab.classList.contains("is-active"))));
    root.classList.add("vov-mobile-nav-ready");
    stepper.hidden = false;
    return update;
}
