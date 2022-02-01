import {
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import {
    FAN_CARD_EDITOR_NAME,
    FAN_CARD_NAME,
    FAN_ENTITY_DOMAINS,
} from "./const";
import "./controls/fan-oscillate-control";
import "./controls/fan-percentage-control";
import { FanCardConfig } from "./fan-card-config";
import "./fan-card-editor";
import { getPercentage, isActive } from "./utils";

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
        const vertical = this._config.vertical;
        const hideState = this._config.hide_state;

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

        const active = isActive(entity);

        return html`
            <ha-card>
                <div class="container">
                    <mushroom-state-item
                        .vertical=${vertical}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                        })}
                    >
                        <mushroom-shape-icon
                            slot="icon"
                            class=${classMap({
                                spin: active && !!this._config.icon_animation,
                            })}
                            style=${styleMap({
                                "--animation-duration": `${1 / speed}s`,
                            })}
                            .disabled=${!isActive(entity)}
                            .icon=${icon}
                        ></mushroom-shape-icon>
                        ${entity.state === "unavailable"
                            ? html` <mushroom-badge-icon
                                  class="unavailable"
                                  slot="badge"
                                  icon="mdi:help"
                              ></mushroom-badge-icon>`
                            : null}
                        <mushroom-state-info
                            slot="info"
                            .primary=${name}
                            .secondary=${!hideState && stateValue}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                    ${this._config.show_percentage_control ||
                    this._config.show_oscillate_control
                        ? html`
                              <div class="actions">
                                  ${this._config.show_percentage_control
                                      ? html`
                                            <mushroom-fan-percentage-control
                                                .hass=${this.hass}
                                                .entity=${entity}
                                            ></mushroom-fan-percentage-control>
                                        `
                                      : null}
                                  ${this._config.show_oscillate_control
                                      ? html`
                                            <mushroom-fan-oscillate-control
                                                .hass=${this.hass}
                                                .entity=${entity}
                                            ></mushroom-fan-oscillate-control>
                                        `
                                      : null}
                              </div>
                          `
                        : null}
                </div>
            </ha-card>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgb(var(--rgb-state-fan));
                    --shape-color: rgba(var(--rgb-state-fan), 0.2);
                }
                mushroom-shape-icon.spin {
                    --icon-animation: var(--animation-duration) infinite linear
                        spin;
                }
                mushroom-shape-icon ha-icon {
                    color: red !important;
                }
                mushroom-fan-percentage-control {
                    flex: 1;
                }
            `,
        ];
    }
}
