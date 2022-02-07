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
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
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
    LIGHT_CARD_EDITOR_NAME,
    LIGHT_CARD_NAME,
    LIGHT_ENTITY_DOMAINS,
} from "./const";
import "./controls/light-brightness-control";
import "./controls/light-color-temp-control";
import "./controls/light-color-control";
import { LightCardConfig } from "./light-card-config";
import "./light-card-editor";
import { getBrightness, getRGBColor, isActive } from "./utils";
import Color from "color";

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
export class LightCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            LIGHT_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<LightCardConfig> {
        const entities = Object.keys(hass.states);
        const lights = entities.filter((e) =>
            LIGHT_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${LIGHT_CARD_NAME}`,
            entity: lights[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: LightCardConfig;

    @state() private _activeControl?: LightCardControl;

    @state() private _controls: LightCardControl[][] = [];
    @state() private _currentControlsIndex = 0;

    get _nextControls(): LightCardControl[] | undefined {
        if (this._activeControl) {
            return this._controls[this._nextControlsIndex];
        }
        return undefined;
    }

    get _nextControlsIndex(): number {
        return (this._currentControlsIndex + 1)%this._controls.length;
    }

    _onControlTap(ctrl, e): void {
        e.stopPropagation();
        this._activeControl = ctrl;
        this._currentControlsIndex = this._nextControlsIndex;
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
    }

    private get _hasColorTempControl(): boolean {
        const entity_id = this._config?.entity;
        if (this._config?.show_color_temp_control && entity_id) {
            const entity = this.hass.states[entity_id];
            return !!(entity.attributes.supported_color_modes.find(m => m === "color_temp"));
        }
        return false;
    }

    private get _hasColorControl(): boolean {
        const entity_id = this._config?.entity;
        if (this._config?.show_color_control && entity_id) {
            const entity = this.hass.states[entity_id];
            return !!(entity.attributes.supported_color_modes.find(m => ["hs", "rgbw", "rgbww"].indexOf(m) > -1));
        }
        return false;
    }

    private _setControls() {
        const controls: LightCardControl[][] = [];
        if (this._config?.show_brightness_control) {
            controls.push(["brightness_control"]);
        }


        const secondaryControls: LightCardControl[] = [];
        if (this._hasColorTempControl) {
            secondaryControls.push("color_temp_control");
        }
        if (this._hasColorControl) {
            secondaryControls.push("color_control");
        }

        if (secondaryControls.length) {
            if (controls.length) {
                controls.push(secondaryControls);
            } else {
                secondaryControls.forEach(ctrl => controls.push([ctrl]));
            }
        }
        this._controls = controls;
        this._activeControl = this._activeControl || (controls.length ? controls[0][0] : undefined);
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

        this._setControls();

        const name = this._config.name ?? entity.attributes.friendly_name;
        const icon = this._config.icon ?? stateIcon(entity);

        const vertical = !!this._config.vertical;
        const hideState = !!this._config.hide_state;

        const active = isActive(entity);

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale
        );

        const brightness = getBrightness(entity);

        const stateValue = brightness != null ? `${brightness}%` : stateDisplay;

        const iconRgbColor = getRGBColor(entity);
        const iconStyle = {};
        if (iconRgbColor && this._config?.use_light_icon_color) {
            if (entity.attributes.color_mode !== "color_temp") {
                const [r,g,b] = iconRgbColor.split(',').map(c => parseInt(""+c));
                const color = Color.rgb([r, g, b]);
                const transformedColor = color
                    .saturationl(100)
                    .lightness(50)
                    .fade(0.8)
                    .rgb()
                    .array();
    
                    iconStyle["--shape-color"] = `rgba(${transformedColor.join(',')})`;
            }

            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
        }

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
                            .disabled=${!active}
                            .icon=${icon}
                            style=${styleMap(iconStyle)}
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
                    ${this._controls.length > 0
                        ? html`
                              <div class="actions">
                                  ${this.renderActiveControl(entity)}
                                  ${this.renderNextControlButtons()}
                              </div>
                          `
                        : null}
                </div>
            </ha-card>
        `;
    }

    private renderNextControlButtons(): TemplateResult | null {
        if (!this._nextControls || this._currentControlsIndex == this._nextControlsIndex) {
            return null;
        }

        let controls = this._nextControls.map(ctrl => html`<mushroom-button
                .icon=${CONTROLS_ICONS[ctrl]}
                @click=${(e) => this._onControlTap(ctrl, e)}
            />`);
        return html`${controls}`;
    }

    private renderActiveControl(entity: HassEntity): TemplateResult | null {
        switch (this._activeControl) {
            case "brightness_control":
                return html`
                    <mushroom-light-brightness-control
                        .hass=${this.hass}
                        .entity=${entity}
                    />
                `;
            case "color_temp_control":
                return html`
                    <mushroom-light-color-temp-control
                        .hass=${this.hass}
                        .entity=${entity}
                    />
                `;
            case "color_control":
                return html`
                    <mushroom-light-color-control
                        .hass=${this.hass}
                        .entity=${entity}
                    />
                `;
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
                    --icon-color: rgb(var(--rgb-state-light));
                    --shape-color: rgba(var(--rgb-state-light), 0.25);
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
