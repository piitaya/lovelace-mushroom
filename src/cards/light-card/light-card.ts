import { css, CSSResultGroup, html, nothing, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
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
    LightEntity,
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
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import { LIGHT_CARD_EDITOR_NAME, LIGHT_CARD_NAME, LIGHT_ENTITY_DOMAINS } from "./const";
import "./controls/light-brightness-control";
import "./controls/light-color-control";
import "./controls/light-color-temp-control";
import { LightCardConfig } from "./light-card-config";
import {
    getBrightness,
    getRGBColor,
    isColorLight,
    isColorSuperLight,
    supportsBrightnessControl,
    supportsColorControl,
    supportsColorTempControl,
} from "./utils";

type LightCardControl = "brightness_control" | "color_temp_control" | "color_control";

const CONTROLS_ICONS: Record<LightCardControl, string> = {
    brightness_control: "mdi:brightness-4",
    color_temp_control: "mdi:thermometer",
    color_control: "mdi:palette",
};

registerCustomCard({
    type: LIGHT_CARD_NAME,
    name: "Mushroom Light Card",
    description: "Card for light entity",
});

@customElement(LIGHT_CARD_NAME)
export class LightCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./light-card-editor");
        return document.createElement(LIGHT_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<LightCardConfig> {
        const entities = Object.keys(hass.states);
        const lights = entities.filter((e) => LIGHT_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${LIGHT_CARD_NAME}`,
            entity: lights[0],
        };
    }

    @state() private _config?: LightCardConfig;

    @state() private _activeControl?: LightCardControl;

    @state() private _controls: LightCardControl[] = [];

    _onControlTap(ctrl, e): void {
        e.stopPropagation();
        this._activeControl = ctrl;
    }

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: LightCardConfig): void {
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
        this.updateBrightness();
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updateControls();
            this.updateBrightness();
        }
    }

    @state()
    private brightness?: number;

    updateBrightness() {
        this.brightness = undefined;
        if (!this._config || !this.hass || !this._config.entity) return;

        const entityId = this._config.entity;
        const stateObj = this.hass.states[entityId] as LightEntity | undefined;

        if (!stateObj) return;
        this.brightness = getBrightness(stateObj);
    }

    private onCurrentBrightnessChange(e: CustomEvent<{ value?: number }>): void {
        if (e.detail.value != null) {
            this.brightness = e.detail.value;
        }
    }

    updateControls() {
        if (!this._config || !this.hass || !this._config.entity) return;

        const entityId = this._config.entity;
        const stateObj = this.hass.states[entityId] as LightEntity | undefined;

        if (!stateObj) return;

        const controls: LightCardControl[] = [];
        if (!this._config.collapsible_controls || isActive(stateObj)) {
            if (this._config.show_brightness_control && supportsBrightnessControl(stateObj)) {
                controls.push("brightness_control");
            }
            if (this._config.show_color_temp_control && supportsColorTempControl(stateObj)) {
                controls.push("color_temp_control");
            }
            if (this._config.show_color_control && supportsColorControl(stateObj)) {
                controls.push("color_control");
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
        if (!this._config || !this.hass || !this._config.entity) {
            return nothing;
        }

        const entityId = this._config.entity;
        const stateObj = this.hass.states[entityId] as LightEntity | undefined;

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
        if (this.brightness != null) {
            stateDisplay = `${this.brightness}${blankBeforePercent(this.hass.locale)}%`;
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
                                  ${this.renderActiveControl(stateObj)}
                                  ${this.renderOtherControls()}
                              </div>
                          `
                        : nothing}
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderIcon(stateObj: LightEntity, icon?: string): TemplateResult {
        const lightRgbColor = getRGBColor(stateObj);
        const active = isActive(stateObj);
        const iconStyle = {};
        const iconColor = this._config?.icon_color;
        if (lightRgbColor && this._config?.use_light_color) {
            const color = lightRgbColor.join(",");
            iconStyle["--icon-color"] = `rgb(${color})`;
            iconStyle["--shape-color"] = `rgba(${color}, 0.25)`;
            if (isColorLight(lightRgbColor) && !(this.hass.themes as any).darkMode) {
                iconStyle["--shape-outline-color"] = `rgba(var(--rgb-primary-text-color), 0.05)`;
                if (isColorSuperLight(lightRgbColor)) {
                    iconStyle["--icon-color"] = `rgba(var(--rgb-primary-text-color), 0.2)`;
                }
            }
        } else if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
        }
        return html`
            <mushroom-shape-icon slot="icon" .disabled=${!active} style=${styleMap(iconStyle)}>
                <ha-state-icon
                    .hass=${this.hass}
                    .stateObj=${stateObj}
                    .state=${stateObj}
                    .icon=${icon}
                ></ha-state-icon>
            </mushroom-shape-icon>
        `;
    }

    private renderOtherControls(): TemplateResult | null {
        const otherControls = this._controls.filter((control) => control != this._activeControl);

        return html`
            ${otherControls.map(
                (ctrl) => html`
                    <mushroom-button @click=${(e) => this._onControlTap(ctrl, e)}>
                        <ha-icon .icon=${CONTROLS_ICONS[ctrl]}></ha-icon>
                    </mushroom-button>
                `
            )}
        `;
    }

    private renderActiveControl(entity: LightEntity) {
        switch (this._activeControl) {
            case "brightness_control":
                const lightRgbColor = getRGBColor(entity);
                const sliderStyle = {};
                const iconColor = this._config?.icon_color;
                if (lightRgbColor && this._config?.use_light_color) {
                    const color = lightRgbColor.join(",");
                    sliderStyle["--slider-color"] = `rgb(${color})`;
                    sliderStyle["--slider-bg-color"] = `rgba(${color}, 0.2)`;
                    if (isColorLight(lightRgbColor) && !(this.hass.themes as any).darkMode) {
                        sliderStyle[
                            "--slider-bg-color"
                        ] = `rgba(var(--rgb-primary-text-color), 0.05)`;
                        sliderStyle["--slider-color"] = `rgba(var(--rgb-primary-text-color), 0.15)`;
                    }
                } else if (iconColor) {
                    const iconRgbColor = computeRgbColor(iconColor);
                    sliderStyle["--slider-color"] = `rgb(${iconRgbColor})`;
                    sliderStyle["--slider-bg-color"] = `rgba(${iconRgbColor}, 0.2)`;
                }
                return html`
                    <mushroom-light-brightness-control
                        .hass=${this.hass}
                        .entity=${entity}
                        style=${styleMap(sliderStyle)}
                        @current-change=${this.onCurrentBrightnessChange}
                    />
                `;
            case "color_temp_control":
                return html`
                    <mushroom-light-color-temp-control .hass=${this.hass} .entity=${entity} />
                `;
            case "color_control":
                return html`
                    <mushroom-light-color-control .hass=${this.hass} .entity=${entity} />
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
                mushroom-shape-icon {
                    --icon-color: rgb(var(--rgb-state-light));
                    --shape-color: rgba(var(--rgb-state-light), 0.2);
                }
                mushroom-light-brightness-control,
                mushroom-light-color-temp-control,
                mushroom-light-color-control {
                    flex: 1;
                }
            `,
        ];
    }
}
