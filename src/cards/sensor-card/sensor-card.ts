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
import { styleMap } from "lit/directives/style-map.js";
import "../../shared/badge-icon";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import {
    SENSOR_CARD_EDITOR_NAME,
    SENSOR_CARD_NAME,
    SENSOR_ENTITY_DOMAINS,
} from "./const";
import { SensorCardConfig } from "./sensor-card-config";
import "./sensor-card-editor";
import { getInfo, isActive } from "./utils";

registerCustomCard({
    type: SENSOR_CARD_NAME,
    name: "Mushroom Sensor Card",
    description: "Card for sensor and binary sensor entity",
});

@customElement(SENSOR_CARD_NAME)
export class SensorCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            SENSOR_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<SensorCardConfig> {
        const entities = Object.keys(hass.states);
        const switches = entities.filter((e) =>
            SENSOR_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${SENSOR_CARD_NAME}`,
            entity: switches[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: SensorCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: SensorCardConfig): void {
        this._config = {
            tap_action: {
                action: "more-info",
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

        const entityId = this._config.entity;
        const entity = this.hass.states[entityId];

        const name = this._config.name ?? entity.attributes.friendly_name ?? "";
        const icon = this._config.icon ?? stateIcon(entity);
        const vertical = this._config.vertical;

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale
        );

        const primary = getInfo(
            this._config.primary_info ?? "name",
            name,
            stateDisplay,
            entity,
            this.hass
        );
        const secondary = getInfo(
            this._config.secondary_info ?? "state",
            name,
            stateDisplay,
            entity,
            this.hass
        );

        const iconColor = this._config.icon_color;
        const iconStyle = {};
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
        }

        return html`<ha-card>
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
                        .disabled=${!isActive(entity)}
                        .icon=${icon}
                        style=${styleMap(iconStyle)}
                    ></mushroom-shape-icon>
                    ${entity.state === "unavailable"
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
                        .primary=${primary}
                        .secondary=${secondary}
                    ></mushroom-state-info>
                </mushroom-state-item>
            </div>
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgb(var(--rgb-state-sensor));
                    --shape-color: rgba(var(--rgb-state-sensor), 0.2);
                }
            `,
        ];
    }
}
