import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
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
import { FAN_CARD_EDITOR_NAME, FAN_CARD_NAME, FAN_ENTITY_DOMAINS } from "./const";
import "./controls/fan-oscillate-control";
import "./controls/fan-percentage-control";
import { FanCardConfig } from "./fan-card-config";
import { getPercentage } from "./utils";

registerCustomCard({
    type: FAN_CARD_NAME,
    name: "Mushroom Fan Card",
    description: "Card for fan entity",
});

@customElement(FAN_CARD_NAME)
export class FanCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./fan-card-editor");
        return document.createElement(FAN_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<FanCardConfig> {
        const entities = Object.keys(hass.states);
        const fans = entities.filter((e) => FAN_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${FAN_CARD_NAME}`,
            entity: fans[0],
        };
    }

    @state() private _config?: FanCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: FanCardConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
        this.updatePercentage();
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updatePercentage();
        }
    }

    @state()
    private percentage?: number;

    updatePercentage() {
        this.percentage = undefined;
        if (!this._config || !this.hass || !this._config.entity) return;

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        if (!entity) return;
        this.percentage = getPercentage(entity);
    }

    private onCurrentPercentageChange(e: CustomEvent<{ value?: number }>): void {
        if (e.detail.value != null) {
            this.percentage = Math.round(e.detail.value);
        }
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
        const appearance = computeAppearance(this._config);
        const picture = computeEntityPicture(entity, appearance.icon_type);

        let stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale,
            this.hass.entities,
            this.hass.connection.haVersion,
        );
        if (this.percentage != null) {
            stateDisplay = `${this.percentage}${blankBeforePercent(this.hass.locale)}%`;
        }

        const rtl = computeRTL(this.hass);

        const displayControls =
            (!this._config.collapsible_controls || isActive(entity)) &&
            (this._config.show_percentage_control || this._config.show_oscillate_control);

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
                                  ${this._config.show_percentage_control
                                      ? html`
                                            <mushroom-fan-percentage-control
                                                .hass=${this.hass}
                                                .entity=${entity}
                                                @current-change=${this.onCurrentPercentageChange}
                                            ></mushroom-fan-percentage-control>
                                        `
                                      : null}
                                  ${this._config.show_oscillate_control
                                      ? html`
                                            <mushroom-fan-oscillate-control
                                                .hass=${this.hass}
                                                .entity=${entity}
                                            ></mushroom-fan-oscillate-control>
                                        `
                                      : null}
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderIcon(entity: HassEntity, icon: string): TemplateResult {
        let iconStyle = {};
        const percentage = getPercentage(entity);
        const active = isActive(entity);
        if (active) {
            if (percentage) {
                const speed = 1.5 * (percentage / 100) ** 0.5;
                iconStyle["--animation-duration"] = `${1 / speed}s`;
            } else {
                iconStyle["--animation-duration"] = `1s`;
            }
        }

        return html`
            <mushroom-shape-icon
                slot="icon"
                class=${classMap({
                    spin: active && Boolean(this._config?.icon_animation),
                })}
                style=${styleMap(iconStyle)}
                .disabled=${!active}
                .icon=${icon}
            ></mushroom-shape-icon>
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
                    --icon-color: rgb(var(--rgb-state-fan));
                    --shape-color: rgba(var(--rgb-state-fan), 0.2);
                }
                mushroom-shape-icon.spin {
                    --icon-animation: var(--animation-duration) infinite linear spin;
                }
                mushroom-shape-icon ha-icon {
                    color: red !important;
                }
                mushroom-fan-percentage-control {
                    flex: 1;
                }
            `,
        ];
    }
}
