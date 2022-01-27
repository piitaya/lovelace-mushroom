import {
    ActionConfig,
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/state-item";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/button";
import { registerCustomCard } from "../../utils/custom-cards";
import {
    LIGHT_CARD_EDITOR_NAME,
    LIGHT_CARD_NAME,
    LIGHT_ENTITY_DOMAINS,
} from "./const";
import "./controls/light-brightness-control";
import "./controls/light-color-temp-control";
import "./light-card-editor";
import { getBrightness } from "./utils";
import { actionHandler } from "../../utils/directives/action-handler-directive";

type LightCardControl = "brightness_control" | "color_temp_control";

const CONTROLS_ICONS: Record<LightCardControl, string> = {
    brightness_control: "mdi:brightness-4",
    color_temp_control: "mdi:thermometer",
};

export interface LightCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    name?: string;
    show_brightness_control?: boolean;
    show_color_temp_control?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
}

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

    @state() private _controls: LightCardControl[] = [];

    get _nextControl(): LightCardControl | undefined {
        if (this._activeControl) {
            return (
                this._controls[
                    this._controls.indexOf(this._activeControl) + 1
                ] ?? this._controls[0]
            );
        }
        return undefined;
    }

    _onNextControlTap(e): void {
        e.stopPropagation();
        this._activeControl = this._nextControl;
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
        const controls: LightCardControl[] = [];
        if (this._config?.show_brightness_control) {
            controls.push("brightness_control");
        }
        if (this._config?.show_color_temp_control) {
            controls.push("color_temp_control");
        }
        this._controls = controls;
        this._activeControl = controls[0];
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name ?? entity.attributes.friendly_name;
        const icon = this._config.icon ?? stateIcon(entity);

        const state = entity.state;

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale
        );

        const brightness = getBrightness(entity);

        const stateValue = brightness != null ? `${brightness}%` : stateDisplay;
        return html`
            <ha-card>
                <mushroom-state-item
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this._config.hold_action),
                    })}
                >
                    <mushroom-shape-icon
                        slot="icon"
                        .disabled=${state !== "on"}
                        .icon=${icon}
                    ></mushroom-shape-icon>
                    <mushroom-state-info
                        slot="info"
                        .label=${name}
                        .value=${stateValue}
                    ></mushroom-state-info>
                </mushroom-state-item>
                ${this._controls.length > 0
                    ? html`
                          <div class="actions">
                              ${this.renderActiveControl(entity)}
                              ${this.renderNextControlButton()}
                          </div>
                      `
                    : null}
            </ha-card>
        `;
    }

    private renderNextControlButton(): TemplateResult | null {
        if (!this._nextControl || this._nextControl == this._activeControl) {
            return null;
        }

        return html`
            <mushroom-button
                .icon=${CONTROLS_ICONS[this._nextControl]}
                @click=${this._onNextControlTap}
            />
        `;
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
            default:
                return null;
        }
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --rgb-color: 255, 145, 1;
            }
            ha-card {
                display: flex;
                flex-direction: column;
                padding: 12px;
            }
            ha-card > *:not(:last-child) {
                margin-bottom: 12px;
            }
            mushroom-state-item {
                cursor: pointer;
            }
            mushroom-shape-icon {
                --icon-color: rgba(var(--rgb-color), 1);
                --shape-color: rgba(var(--rgb-color), 0.2);
            }
            mushroom-light-brightness-control,
            mushroom-light-color-temp-control {
                flex: 1;
            }
            .actions {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                overflow-y: auto;
            }
            .actions *:not(:last-child) {
                margin-right: 12px;
            }
        `;
    }
}
