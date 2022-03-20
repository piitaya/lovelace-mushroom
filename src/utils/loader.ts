// Hack to load ha-components needed for editor
export const loadHaComponents = () => {
    if (!customElements.get("ha-form") || !customElements.get("hui-action-editor")) {
        (customElements.get("hui-button-card") as any)?.getConfigElement();
    }
    if (!customElements.get("ha-entity-picker")) {
        (customElements.get("hui-conditional-card-editor") as any)?.getConfigElement();
    }
};
