import {
    ActionHandlerEvent,
    computeStateDisplay,
    formatNumber,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
    UNIT_F,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../shared/card";
import "../../shared/state-item";
import "../../shared/state-value";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { isActive } from "../../utils/entity";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import "./controls/climate-temperature-control";
import { ClimateCardConfig } from "./climate-card-config";
import {
    CLIMATE_CARD_EDITOR_NAME,
    CLIMATE_CARD_NAME,
    CLIMATE_ENTITY_DOMAINS,
    CLIMATE_PRESET_NONE,
} from "./const";
import { isNumber } from "../../utils/number";

type ClimateCardControl = "temperature_control";

export type HvacAction = "off" | "heating" | "cooling" | "drying" | "idle";

const MODE_ICONS: Record<HvacAction, string> = {
    off: "mdi:power",
    heating: "mdi:fire",
    cooling: "mdi:snowflake",
    drying: "mdi:water-percent",
    idle: "mdi:thermostat",
};

registerCustomCard({
    type: CLIMATE_CARD_NAME,
    name: "Musshroom - Climate Card",
    description: "Mushroom card for climate entities",
});

@customElement(CLIMATE_CARD_NAME)
export class ClimateCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./climate-card-editor");
        return document.createElement(CLIMATE_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<ClimateCardConfig> {
        const entities = Object.keys(hass.states);
        const panels = entities.filter((e) => CLIMATE_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${CLIMATE_CARD_NAME}`,
            entity: panels[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: ClimateCardConfig;

    @state() private _activeControl?: ClimateCardControl = "temperature_control";

    @state() private _controls: ClimateCardControl[] = [];

    @state() private low?: number;

    @state() private high?: number;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: ClimateCardConfig): void {
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
        this.updateTemps();
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updateTemps();
        }
    }

    updateTemps() {
        this.low = undefined;
        this.high = undefined;
        if (!this._config || !this.hass || !this._config.entity) return;

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        if (!entity) return;
        this.low = entity.attributes.target_temp_low;
        this.high = entity.attributes.target_temp_high;
    }

    private onTempChange(e: CustomEvent<{ low?: number; high?: number }>): void {
        if (e.detail.low) this.low = e.detail.low;
        if (e.detail.high) this.high = e.detail.high;
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const { current_temperature, hvac_action, preset_mode, target_temp_step } =
            entity.attributes;

        const stepSize = target_temp_step
            ? target_temp_step
            : this.hass!.config.unit_system.temperature === UNIT_F
            ? 1
            : 0.5;

        const name = this._config.name || entity.attributes.friendly_name || "";

        const layout = getLayoutFromConfig(this._config);
        const hideState = !!this._config.hide_state;

        const active = isActive(entity);

        const icon =
            this._config.icon || (this._config.use_action_icon && MODE_ICONS[hvac_action])
                ? MODE_ICONS[hvac_action]
                : stateIcon(entity);

        const currentTempDisplay = isNumber(current_temperature)
            ? `${formatNumber(current_temperature, this.hass.locale)} ${
                  this.hass.config.unit_system.temperature
              }`
            : "";

        const state = `${currentTempDisplay && `${currentTempDisplay} | `}${
            hvac_action
                ? this.hass!.localize(`state_attributes.climate.hvac_action.${hvac_action}`)
                : this.hass!.localize(`component.climate.state._.${entity.state}`)
        } ${
            preset_mode && preset_mode !== CLIMATE_PRESET_NONE
                ? `- ${
                      this.hass!.localize(`state_attributes.climate.preset_mode.${preset_mode}`) ||
                      preset_mode
                  }`
                : ""
        }`;

        const formatIndicator = (value: number) => {
            const options: Intl.NumberFormatOptions =
                stepSize === 1
                    ? { maximumFractionDigits: 0 }
                    : { maximumFractionDigits: 1, minimumFractionDigits: 1 };
            return formatNumber(value, this.hass.locale, options);
        };

        const iconStyle = {};
        if (hvac_action && this._config?.use_action_color) {
            iconStyle["--icon-color"] = `rgb(var(--rgb-state-climate-${hvac_action || "idle"}))`;
            iconStyle["--shape-color"] = `rgba(var(--rgb-state-climate-${
                hvac_action || "idle"
            }), 0.25)`;
        }

        return html`
            <mushroom-card .layout=${layout}>
                <mushroom-state-item
                    .layout=${layout}
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this._config.hold_action),
                        hasDoubleClick: hasAction(this._config.double_tap_action),
                    })}
                >
                    <mushroom-shape-icon
                        slot="icon"
                        .disabled=${!active}
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
                        .primary=${name}
                        .secondary=${!hideState && state}
                    ></mushroom-state-info>
                </mushroom-state-item>
                ${this._config.show_temp_control
                    ? html`
                          <div class="actions">
                              ${this._config.show_temp_indicators
                                  ? html`<shroom-state-value
                                        value=${formatIndicator(this.low!)}
                                        color="rgb(var(--rgb-state-climate-heating)"
                                    ></shroom-state-value>`
                                  : html``}
                              <mushroom-climate-temperature-control
                                  .hass=${this.hass}
                                  .entity=${entity}
                                  .gap=${this._config.temperature_gap ?? 0}
                                  @current-change=${this.onTempChange}
                              ></mushroom-climate-temperature-control>
                              ${this._config.show_temp_indicators
                                  ? html`<shroom-state-value
                                        value=${formatIndicator(this.high!)}
                                        color="rgb(var(--rgb-state-climate-cooling)"
                                    ></shroom-state-value>`
                                  : html``}
                          </div>
                      `
                    : html``}
            </mushroom-card>
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
                    --icon-color: rgb(var(--rgb-state-climate-off));
                    --shape-color: rgba(var(--rgb-state-climate-off), 0.2);
                }
            `,
        ];
    }
}
