import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeStateDisplay } from "../../ha/common/entity/compute-state-display";
import { isActive, isAvailable } from "../../ha/data/entity";
import { HumidifierEntity } from "../../ha/data/humidifier";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import {
    HUMIDIFIER_CARD_EDITOR_NAME,
    HUMIDIFIER_CARD_NAME,
    HUMIDIFIER_ENTITY_DOMAINS,
} from "./const";
import "./controls/humidifier-humidity-control";
import { HumidifierCardConfig } from "./humidifier-card-config";
import { getHumidity } from "./utils";

registerCustomCard({
    type: HUMIDIFIER_CARD_NAME,
    name: "Mushroom Humidifier Card",
    description: "Card for humidifier entity",
});

@customElement(HUMIDIFIER_CARD_NAME)
export class HumidifierCard extends LitElement implements LovelaceCard {
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

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: HumidifierCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: HumidifierCardConfig): void {
        this._config = {
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            double_tap_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
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

        const iconColor = this._config.icon_color;

        const rtl = computeRTL(this.hass);

        return html`
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
                    ${this.renderIcon(icon, iconColor, isActive(entity))}
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
                        .secondary=${!hideState && stateDisplay}
                    ></mushroom-state-info>
                </mushroom-state-item>
                ${this._config.show_target_humidity_control
                    ? html`
                          <div class="actions" ?rtl=${rtl}>
                              <mushroom-humidifier-humidity-control
                                  .hass=${this.hass}
                                  .entity=${entity}
                              ></mushroom-humidifier-humidity-control>
                          </div>
                      `
                    : null}
            </mushroom-card>
        `;
    }

    renderIcon(icon: string, iconColor: string | undefined, active: boolean): TemplateResult {
        const iconStyle = {
            "--icon-color": "rgb(var(--rgb-state-humidifier))",
            "--shape-color": "rgba(var(--rgb-state-humidifier), 0.2)",
        };
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
        }
        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!active}
                .icon=${icon}
                style=${styleMap(iconStyle)}
            ></mushroom-shape-icon>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }                
                mushroom-humidifier-humidity-control {
                    flex: 1;
                }
            `,
        ];
    }
}
