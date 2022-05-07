import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeStateDisplay } from "../../ha/common/entity/compute-state-display";
import { isActive, isAvailable } from "../../ha/data/entity";
import { LightEntity } from "../../ha/data/light";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { MushroomBaseElement } from "../../utils/base-element";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
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
export class LightCard extends MushroomBaseElement implements LovelaceCard {
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

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as LightEntity;

        if (!entity) return;
        this.brightness = getBrightness(entity);
    }

    private onCurrentBrightnessChange(e: CustomEvent<{ value?: number }>): void {
        if (e.detail.value != null) {
            this.brightness = e.detail.value;
        }
    }

    updateControls() {
        if (!this._config || !this.hass || !this._config.entity) return;

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as LightEntity;

        if (!entity) return;

        const controls: LightCardControl[] = [];
        if (!this._config.collapsible_controls || isActive(entity)) {
            if (this._config.show_brightness_control && supportsBrightnessControl(entity)) {
                controls.push("brightness_control");
            }
            if (this._config.show_color_temp_control && supportsColorTempControl(entity)) {
                controls.push("color_temp_control");
            }
            if (this._config.show_color_control && supportsColorControl(entity)) {
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

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as LightEntity;

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);

        const layout = getLayoutFromConfig(this._config);
        const hideState = !!this._config.hide_state;

        const active = isActive(entity);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const stateValue = this.brightness != null ? `${this.brightness}%` : stateDisplay;

        const lightRgbColor = getRGBColor(entity);
        const iconStyle = {};
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
        }

        const rtl = computeRTL(this.hass);

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
                        <mushroom-shape-icon
                            slot="icon"
                            .disabled=${!active}
                            .icon=${icon}
                            style=${styleMap(iconStyle)}
                        ></mushroom-shape-icon>
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
                    ${this._controls.length > 0
                        ? html`
                              <div class="actions" ?rtl=${rtl}>
                                  ${this.renderActiveControl(entity)} ${this.renderOtherControls()}
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
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
                    />
                `
            )}
        `;
    }

    private renderActiveControl(entity: LightEntity): TemplateResult | null {
        switch (this._activeControl) {
            case "brightness_control":
                const lightRgbColor = getRGBColor(entity);
                const sliderStyle = {};
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
                return null;
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
