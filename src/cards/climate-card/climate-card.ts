import { css, CSSResultGroup, html, nothing, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    ClimateEntity,
    computeRTL,
    computeStateDisplay,
    formatNumber,
    handleAction,
    hasAction,
    HomeAssistant,
    HvacMode,
    isActive,
    isAvailable,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import { ClimateCardConfig } from "./climate-card-config";
import { CLIMATE_CARD_EDITOR_NAME, CLIMATE_CARD_NAME, CLIMATE_ENTITY_DOMAINS } from "./const";
import "./controls/climate-hvac-modes-control";
import { isHvacModesVisible } from "./controls/climate-hvac-modes-control";
import "./controls/climate-temperature-control";
import { isTemperatureControlVisible } from "./controls/climate-temperature-control";
import { getHvacActionColor, getHvacActionIcon, getHvacModeColor } from "./utils";

type ClimateCardControl = "temperature_control" | "hvac_mode_control";

const CONTROLS_ICONS: Record<ClimateCardControl, string> = {
    temperature_control: "mdi:thermometer",
    hvac_mode_control: "mdi:thermostat",
};

registerCustomCard({
    type: CLIMATE_CARD_NAME,
    name: "Mushroom Climate Card",
    description: "Card for climate entity",
});

@customElement(CLIMATE_CARD_NAME)
export class ClimateCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./climate-card-editor");
        return document.createElement(CLIMATE_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<ClimateCardConfig> {
        const entities = Object.keys(hass.states);
        const climates = entities.filter((e) => CLIMATE_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${CLIMATE_CARD_NAME}`,
            entity: climates[0],
        };
    }

    @state() private _config?: ClimateCardConfig;

    @state() private _activeControl?: ClimateCardControl;

    @state() private _controls: ClimateCardControl[] = [];

    _onControlTap(ctrl, e): void {
        e.stopPropagation();
        this._activeControl = ctrl;
    }

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: ClimateCardConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
        this.updateControls();
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updateControls();
        }
    }

    updateControls() {
        if (!this._config || !this.hass || !this._config.entity) return;

        const entityId = this._config.entity;
        const stateObj = this.hass.states[entityId] as ClimateEntity | undefined;

        if (!stateObj) return;

        const controls: ClimateCardControl[] = [];
        if (!this._config.collapsible_controls || isActive(stateObj)) {
            if (isTemperatureControlVisible(stateObj) && this._config.show_temperature_control) {
                controls.push("temperature_control");
            }
            if (isHvacModesVisible(stateObj, this._config.hvac_modes)) {
                controls.push("hvac_mode_control");
            }
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

    protected render() {
        if (!this.hass || !this._config || !this._config.entity) {
            return nothing;
        }

        const entityId = this._config.entity;
        const stateObj = this.hass.states[entityId] as ClimateEntity | undefined;

        if (!stateObj) {
            return this.renderNotFound(this._config);
        }

        const name = this._config.name || stateObj.attributes.friendly_name || "";
        const icon = this._config.icon;
        const appearance = computeAppearance(this._config);
        const picture = computeEntityPicture(stateObj, appearance.icon_type);

        let stateDisplay = this.hass.formatEntityState
            ? this.hass.formatEntityState(stateObj)
            : computeStateDisplay(
                  this.hass.localize,
                  stateObj,
                  this.hass.locale,
                  this.hass.config,
                  this.hass.entities
              );
        if (stateObj.attributes.current_temperature !== null) {
            const temperature = formatNumber(
                stateObj.attributes.current_temperature,
                this.hass.locale
            );
            const unit = this.hass.config.unit_system.temperature;
            stateDisplay += ` - ${temperature} ${unit}`;
        }
        const rtl = computeRTL(this.hass);

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
                        ${picture ? this.renderPicture(picture) : this.renderIcon(stateObj, icon)}
                        ${this.renderBadge(stateObj)}
                        ${this.renderStateInfo(stateObj, appearance, name, stateDisplay)};
                    </mushroom-state-item>
                    ${this._controls.length > 0
                        ? html`
                              <div class="actions" ?rtl=${rtl}>
                                  ${this.renderActiveControl(stateObj)}${this.renderOtherControls()}
                              </div>
                          `
                        : nothing}
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderIcon(stateObj: ClimateEntity, icon?: string): TemplateResult {
        const available = isAvailable(stateObj);
        const color = getHvacModeColor(stateObj.state as HvacMode);
        const iconStyle = {};
        iconStyle["--icon-color"] = `rgb(${color})`;
        iconStyle["--shape-color"] = `rgba(${color}, 0.2)`;

        return html`
            <mushroom-shape-icon slot="icon" .disabled=${!available} style=${styleMap(iconStyle)}>
                <ha-state-icon .state=${stateObj} .icon=${icon}></ha-state-icon>
            </mushroom-shape-icon>
        `;
    }

    protected renderBadge(entity: ClimateEntity) {
        const unavailable = !isAvailable(entity);
        if (unavailable) {
            return super.renderBadge(entity);
        } else {
            return this.renderActionBadge(entity);
        }
    }

    renderActionBadge(entity: ClimateEntity) {
        const hvac_action = entity.attributes.hvac_action;
        if (!hvac_action || hvac_action == "off") return nothing;

        const color = getHvacActionColor(hvac_action);
        const icon = getHvacActionIcon(hvac_action);

        if (!icon) return nothing;

        return html`
            <mushroom-badge-icon
                slot="badge"
                .icon=${icon}
                style=${styleMap({
                    "--main-color": `rgb(${color})`,
                })}
            ></mushroom-badge-icon>
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

    private renderActiveControl(entity: ClimateEntity) {
        const hvac_modes = this._config!.hvac_modes ?? [];
        const appearance = computeAppearance(this._config!);

        switch (this._activeControl) {
            case "temperature_control":
                return html`
                    <mushroom-climate-temperature-control
                        .hass=${this.hass}
                        .entity=${entity}
                        .fill=${appearance.layout !== "horizontal"}
                    ></mushroom-climate-temperature-control>
                `;
            case "hvac_mode_control":
                return html`
                    <mushroom-climate-hvac-modes-control
                        .hass=${this.hass}
                        .entity=${entity}
                        .modes=${hvac_modes}
                        .fill=${appearance.layout !== "horizontal"}
                    ></mushroom-climate-hvac-modes-control>
                `;
            default:
                return nothing;
        }
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-climate-temperature-control,
                mushroom-climate-hvac-modes-control {
                    flex: 1;
                }
            `,
        ];
    }
}
