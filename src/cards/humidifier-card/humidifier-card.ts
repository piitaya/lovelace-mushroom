import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeStateDisplay } from "../../ha/common/entity/compute-state-display";
import { isActive, isAvailable } from "../../ha/data/entity";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../ha/panels/lovelace/common/directives/action-handler-directive";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import {
    HUMIDIFIER_CARD_EDITOR_NAME,
    HUMIDIFIER_CARD_NAME,
    HUMIDIFIER_ENTITY_DOMAINS,
} from "./const";
import "./controls/humidifier-humidity-control";
import { HumidifierCardConfig } from "./humidifier-card-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { classMap } from "lit/directives/class-map.js";
import { HomeAssistant } from "../../ha/types";

registerCustomCard({
    type: HUMIDIFIER_CARD_NAME,
    name: "Mushroom Humidifier Card",
    description: "Card for humidifier entity",
});

@customElement(HUMIDIFIER_CARD_NAME)
export class HumidifierCard extends MushroomBaseElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./humidifier-card-editor");
        return document.createElement(HUMIDIFIER_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<HumidifierCardConfig> {
        const entities = Object.keys(hass.states);
        const humidifiers = entities.filter((e) =>
            HUMIDIFIER_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${HUMIDIFIER_CARD_NAME}`,
            entity: humidifiers[0],
        };
    }

    @state() private _config?: HumidifierCardConfig;

    @state() private humidity?: number;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: HumidifierCardConfig): void {
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

    private onCurrentHumidityChange(e: CustomEvent<{ value?: number }>): void {
        if (e.detail.value != null) {
            this.humidity = e.detail.value;
        }
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const layout = getLayoutFromConfig(this._config);
        const hideState = this._config.hide_state || false;

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const rtl = computeRTL(this.hass);

        let stateValue = `${stateDisplay}`;
        if (this.humidity) {
            stateValue = `${this.humidity} %`;
        }

        const displayControls =
            (!this._config.collapsible_controls || isActive(entity)) &&
            this._config.show_target_humidity_control;

        return html`
            <ha-card class=${classMap({ "fill-container": this._config.fill_container ?? false })}>
                <mushroom-card .layout=${layout} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .layout=${layout}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        ${this.renderIcon(icon, isActive(entity))}
                        ${!isAvailable(entity)
                            ? html`
                                  <mushroom-badge-icon
                                      class="unavailable"
                                      slot="badge"
                                      icon="mdi:help"
                                  ></mushroom-badge-icon>
                              `
                            : null}
                        <mushroom-state-info
                            slot="info"
                            .primary=${name}
                            .secondary=${!hideState && stateValue}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                    ${displayControls
                        ? html`
                              <div class="actions" ?rtl=${rtl}>
                                  <mushroom-humidifier-humidity-control
                                      .hass=${this.hass}
                                      .entity=${entity}
                                      @current-change=${this.onCurrentHumidityChange}
                                  ></mushroom-humidifier-humidity-control>
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
        `;
    }

    renderIcon(icon: string, active: boolean): TemplateResult {
        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!active}
                .icon=${icon}
            ></mushroom-shape-icon>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgb(var(--rgb-state-humidifier));
                    --shape-color: rgba(var(--rgb-state-humidifier), 0.2);
                }
                mushroom-humidifier-humidity-control {
                    flex: 1;
                }
            `,
        ];
    }
}
