import {
    ActionHandlerEvent,
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
import "./controls/thermostat-mode-control";
import "./controls/thermostat-temperature-control";
import { ThermostatCardConfig } from "./thermostat-card-config";
import {
    THERMOSTAT_CARD_EDITOR_NAME,
    THERMOSTAT_CARD_NAME,
    THERMOSTAT_ENTITY_DOMAINS,
    CLIMATE_PRESET_NONE,
} from "./const";
import { HassEntity } from "home-assistant-js-websocket";
import { formatDegrees, getStepSize } from "./utils";
import { climateIconAction } from "../../utils/icons/climate-icon";

type ThermostatCardControl = "temperature_control" | "mode_control";

const CONTROLS_ICONS: Record<ThermostatCardControl, string> = {
    mode_control: "mdi:thermostat",
    temperature_control: "mdi:thermometer",
};

registerCustomCard({
    type: THERMOSTAT_CARD_NAME,
    name: "Mushroom - Thermostat Card",
    description: "Mushroom card for climate entities",
});

@customElement(THERMOSTAT_CARD_NAME)
export class ThermostatCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./thermostat-card-editor");
        return document.createElement(THERMOSTAT_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<ThermostatCardConfig> {
        const entities = Object.keys(hass.states);
        const panels = entities.filter((e) => THERMOSTAT_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${THERMOSTAT_CARD_NAME}`,
            entity: panels[0],
            temperature_gap: hass.config.unit_system.temperature === UNIT_F ? 2 : 1,
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: ThermostatCardConfig;

    @state() private _activeControl?: ThermostatCardControl;

    @state() private _controls: ThermostatCardControl[] = [];

    _onControlTap(ctrl, e): void {
        e.stopPropagation();
        this._activeControl = ctrl;
    }

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: ThermostatCardConfig): void {
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
        this.updateControls();
    }

    updateControls() {
        if (!this._config || !this.hass || !this._config.entity) return;

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        if (!entity) return;

        const controls: ThermostatCardControl[] = [];
        if (this._config.show_temp_control) {
            controls.push("temperature_control");
        }
        if (this._config.show_mode_control) {
            controls.push("mode_control");
        }
        this._controls = controls;
        const isActiveControlSupported = this._activeControl
            ? controls.includes(this._activeControl)
            : false;
        this._activeControl = isActiveControlSupported ? this._activeControl : controls[0];
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updateControls();
        }
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const { current_temperature: currentTemp, hvac_action, preset_mode } = entity.attributes;

        const name = this._config.name || entity.attributes.friendly_name || "";

        const layout = getLayoutFromConfig(this._config);
        const hideState = !!this._config.hide_state;

        const actionIcon = climateIconAction(hvac_action);

        const icon =
            this._config.icon || (this._config.use_action_icon && actionIcon)
                ? actionIcon
                : stateIcon(entity);

        const step = getStepSize(this.hass, entity);

        const formattedCurrentTemp = formatDegrees(this.hass, currentTemp, step);
        const currentTempDisplay = `${formattedCurrentTemp} ${this.hass.config.unit_system.temperature}`;

        const state = `${currentTempDisplay} | ${
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

        const iconStyle = {};
        if (this._config?.use_action_color && hvac_action && hvac_action !== "idle") {
            iconStyle["--icon-color"] = `rgb(var(--rgb-action-climate-${hvac_action}))`;
            iconStyle["--shape-color"] = `rgba(var(--rgb-action-climate-${hvac_action}), 0.25)`;
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
                        .primary=${name}
                        .secondary=${!hideState && state}
                    ></mushroom-state-info>
                </mushroom-state-item>
                ${this._controls.length > 0
                    ? html`
                          <div class="actions">
                              ${this.renderActiveControl(entity)} ${this.renderOtherControls()}
                          </div>
                      `
                    : null}
            </mushroom-card>
        `;
    }

    private renderOtherControls(): TemplateResult | null {
        const otherControls = this._controls.filter((control) => control != this._activeControl);

        return html`
            ${otherControls.map(
                (ctrl) => html`
                    <mushroom-button
                        .icon=${CONTROLS_ICONS[ctrl]}
                        @click=${(e) => this._onControlTap(ctrl, e)}
                    ></mushroom-button>
                `
            )}
        `;
    }

    private renderActiveControl(entity: HassEntity): TemplateResult | null {
        const layout = getLayoutFromConfig(this._config!);

        switch (this._activeControl) {
            case "mode_control":
                return html` <mushroom-thermostat-mode-control
                    .hass=${this.hass}
                    .entity=${entity}
                    .fill=${layout !== "horizontal"}
                ></mushroom-thermostat-mode-control>`;
            case "temperature_control":
                return html`<mushroom-thermostat-temperature-control
                    .hass=${this.hass}
                    .entity=${entity}
                    .gap=${this._config?.temperature_gap ?? 0}
                    .showIndicators=${this._config?.show_temp_indicators}
                ></mushroom-thermostat-temperature-control>`;
            default:
                return null;
        }
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgba(var(--rgb-state-climate-off), 0.5);
                    --shape-color: rgba(var(--rgb-primary-text-color), 0.05);
                }
            `,
        ];
    }
}
