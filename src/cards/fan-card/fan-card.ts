import {
    ActionConfig,
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/state-item";
import "../../shared/button";
import { registerCustomCard } from "../../utils/custom-cards";
import {
    FAN_CARD_EDITOR_NAME,
    FAN_CARD_NAME,
    FAN_ENTITY_DOMAINS,
} from "./const";
import "./fan-card-editor";
import "./controls/fan-percentage-control";
import { getPercentage } from "./utils";
import { actionHandler } from "../../utils/directives/action-handler-directive";

export interface FanCardConfig extends LovelaceCardConfig {
    entity: string;
    name?: string;
    icon?: string;
    icon_spin?: boolean;
    show_percentage_control?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
}

registerCustomCard({
    type: FAN_CARD_NAME,
    name: "Mushroom Fan Card",
    description: "Card for fan entity",
});

@customElement(FAN_CARD_NAME)
export class FanCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            FAN_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<FanCardConfig> {
        const entities = Object.keys(hass.states);
        const fans = entities.filter((e) =>
            FAN_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${FAN_CARD_NAME}`,
            entity: fans[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: FanCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: FanCardConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name ?? entity.attributes.friendly_name;
        const icon = this._config.icon ?? stateIcon(entity);

        const state = entity.state;

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale
        );

        const percentage = getPercentage(entity);

        let stateValue = `${stateDisplay}`;
        if (percentage) {
            stateValue += ` - ${percentage}%`;
        }

        const speed = 1.5 * ((percentage ?? 0) / 100) ** 0.5;

        return html`
            <ha-card>
                <mushroom-state-item
                    .icon=${icon}
                    .name=${name}
                    .value=${stateValue}
                    .active=${state === "on"}
                    .icon_spin=${state === "on" && this._config.icon_spin}
                    .icon_spin_animation_duration=${`${1 / speed}s`}
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this._config.hold_action),
                    })}
                >
                </mushroom-state-item>
               ${
                   this._config.show_percentage_control
                       ? html`<div class="actions">
                             <mushroom-fan-percentage-control
                                 .hass=${this.hass}
                                 .entity=${entity}
                             />
                         </div>`
                       : null
               }
                </div>
            </ha-card>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --rgb-color: 61, 90, 254;
            }
            ha-card {
                display: flex;
                flex-direction: column;
                padding: 12px;
            }
            ha-card > *:not(:last-child) {
                margin-bottom: 12px;
            }
            mushroom-state-item {
                cursor: pointer;
                --icon-main-color: rgba(var(--rgb-color), 1);
                --icon-shape-color: rgba(var(--rgb-color), 0.2);
            }
            mushroom-fan-percentage-control {
                flex: 1;
            }
            .actions {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                overflow-y: auto;
            }
            .actions *:not(:last-child) {
                margin-right: 12px;
            }
        `;
    }
}
