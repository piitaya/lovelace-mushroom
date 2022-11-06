import { atLeastHaVersion } from "../ha";

// Hack to load ha-components needed for editor
export const loadHaComponents = (version: string) => {
    if (
        !customElements.get("ha-form") ||
        (!customElements.get("hui-action-editor") && !atLeastHaVersion(version, 2022, 11))
    ) {
        (customElements.get("hui-button-card") as any)?.getConfigElement();
    }
    if (!customElements.get("ha-entity-picker")) {
        (customElements.get("hui-entities-card") as any)?.getConfigElement();
    }
};
