import {
    computeStateDisplay,
    HomeAssistant,
    stateIcon,
    handleAction,
    ActionHandlerEvent,
    ActionConfig,
    hasAction,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { LovelaceChip } from ".";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { computeChipComponentName } from "../utils";

export type EntityChipConfig = {
    type: "entity";
    entity: string;
    icon?: string;
    icon_color?: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
    double_tap_action?: ActionConfig;
};

@customElement(computeChipComponentName("entity"))
export class EntityChip extends LitElement implements LovelaceChip {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: EntityChipConfig;

    public setConfig(config: EntityChipConfig): void {
        this._config = config;
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
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

        const iconStyle: { [name: string]: string } = {};

        if (this._config.icon_color) {
            iconStyle.color = this._config.icon_color;
        }

        return html`
            <mushroom-chip
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(this._config.hold_action),
                    hasDoubleClick: hasAction(this._config.double_tap_action),
                })}
            >
                <ha-icon .icon=${icon} style=${styleMap(iconStyle)}></ha-icon>
                <span>${stateDisplay}</span>
            </mushroom-chip>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-chip {
                cursor: pointer;
            }
        `;
    }
}
