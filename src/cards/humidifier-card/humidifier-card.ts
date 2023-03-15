import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    blankBeforePercent,
    computeRTL,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    isActive,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { stateIcon } from "../../utils/icons/state-icon";
import { computeEntityPicture } from "../../utils/info";
import {
    HUMIDIFIER_CARD_EDITOR_NAME,
    HUMIDIFIER_CARD_NAME,
    HUMIDIFIER_ENTITY_DOMAINS,
} from "./const";
import "./controls/humidifier-humidity-control";
import { HumidifierCardConfig } from "./humidifier-card-config";

registerCustomCard({
    type: HUMIDIFIER_CARD_NAME,
    name: "Mushroom Humidifier Card",
    description: "Card for humidifier entity",
});

@customElement(HUMIDIFIER_CARD_NAME)
export class HumidifierCard extends MushroomBaseCard implements LovelaceCard {
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
        const appearance = computeAppearance(this._config);
        const picture = computeEntityPicture(entity, appearance.icon_type);

        let stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale,
            this.hass.entities,
            this.hass.connection.haVersion,
        );
        if (this.humidity) {
            stateDisplay = `${this.humidity}${blankBeforePercent(this.hass.locale)}%`;
        }

        const rtl = computeRTL(this.hass);

        const displayControls =
            (!this._config.collapsible_controls || isActive(entity)) &&
            this._config.show_target_humidity_control;

        return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .appearance=${appearance}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        ${picture ? this.renderPicture(picture) : this.renderIcon(entity, icon)}
                        ${this.renderBadge(entity)}
                        ${this.renderStateInfo(entity, appearance, name, stateDisplay)};
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
