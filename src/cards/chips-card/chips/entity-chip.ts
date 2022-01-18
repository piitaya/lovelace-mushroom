import {
    computeStateDisplay,
    HomeAssistant,
    stateIcon,
} from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LovelaceChip } from ".";

export const ENTITY_CHIP_NAME = "mushroom-entity-chip";

export type EntityChipConfig = {
    type: "entity";
    entity: string;
    icon?: string;
};

@customElement(ENTITY_CHIP_NAME)
export class EntityChip extends LitElement implements LovelaceChip {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: EntityChipConfig;

    public setConfig(config: EntityChipConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const icon = this._config.icon ?? stateIcon(entity);

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale
        );

        return html`
            <mushroom-chip .icon=${icon} .label=${stateDisplay}></mushroom-chip>
        `;
    }
}
