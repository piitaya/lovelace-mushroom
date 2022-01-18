import { HomeAssistant } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LovelaceChip } from ".";

export const GENERIC_CHIP_NAME = "mushroom-generic-chip";

export type GenericChipConfig = {
    type: "generic";
    label?: string;
    icon?: string;
};

@customElement(GENERIC_CHIP_NAME)
export class GenericChip extends LitElement implements LovelaceChip {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: GenericChipConfig;

    public setConfig(config: GenericChipConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            <mushroom-chip
                .icon=${this._config.icon}
                .label=${this._config.label}
            ></mushroom-chip>
        `;
    }
}
