import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeStateDisplay } from "../../ha/common/entity/compute-state-display";
import { CoverEntity } from "../../ha/data/cover";
import { isAvailable } from "../../ha/data/entity";
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
import { getLayoutFromConfig, Layout } from "../../utils/layout";
import { COVER_CARD_EDITOR_NAME, COVER_CARD_NAME, COVER_ENTITY_DOMAINS } from "./const";
import "./controls/cover-buttons-control";
import "./controls/cover-position-control";
import { CoverCardConfig } from "./cover-card-config";
import { getPosition, getStateColor } from "./utils";

type CoverCardControl = "buttons_control" | "position_control";

const CONTROLS_ICONS: Record<CoverCardControl, string> = {
    buttons_control: "mdi:gesture-tap-button",
    position_control: "mdi:gesture-swipe-horizontal",
};

registerCustomCard({
    type: COVER_CARD_NAME,
    name: "Mushroom Cover Card",
    description: "Card for cover entity",
});

@customElement(COVER_CARD_NAME)
export class CoverCard extends MushroomBaseElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./cover-card-editor");
        return document.createElement(COVER_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<CoverCardConfig> {
        const entities = Object.keys(hass.states);
        const covers = entities.filter((e) => COVER_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${COVER_CARD_NAME}`,
            entity: covers[0],
        };
    }

    @state() private _config?: CoverCardConfig;

    @state() private _activeControl?: CoverCardControl;

    @state() private _controls: CoverCardControl[] = [];

    get _nextControl(): CoverCardControl | undefined {
        if (this._activeControl) {
            return (
                this._controls[this._controls.indexOf(this._activeControl) + 1] ?? this._controls[0]
            );
        }
        return undefined;
    }

    private _onNextControlTap(e): void {
        e.stopPropagation();
        this._activeControl = this._nextControl;
    }

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: CoverCardConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
        const controls: CoverCardControl[] = [];
        if (this._config?.show_buttons_control) {
            controls.push("buttons_control");
        }
        if (this._config?.show_position_control) {
            controls.push("position_control");
        }
        this._controls = controls;
        this._activeControl = controls[0];
        this.updatePosition();
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updatePosition();
        }
    }

    @state()
    private position?: number;

    updatePosition() {
        this.position = undefined;
        if (!this._config || !this.hass || !this._config.entity) return;

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as CoverEntity;

        if (!entity) return;
        this.position = getPosition(entity);
    }

    private onCurrentPositionChange(e: CustomEvent<{ value?: number }>): void {
        if (e.detail.value != null) {
            this.position = e.detail.value;
        }
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name || entity.attributes.friendly_name;
        const icon = this._config.icon || stateIcon(entity);
        const layout = getLayoutFromConfig(this._config);
        const hideState = this._config.hide_state;

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        let stateValue = `${stateDisplay}`;
        if (this.position) {
            stateValue += ` - ${this.position}%`;
        }

        const available = isAvailable(entity);

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
                        ${this.renderIcon(entity as CoverEntity, icon, available)}
                        ${!available
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
                                  ${this.renderActiveControl(entity, layout)}
                                  ${this.renderNextControlButton()}
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
        `;
    }

    private renderIcon(entity: CoverEntity, icon: string, available: boolean): TemplateResult {
        const iconStyle = {};
        const color = getStateColor(entity);
        console.log(color);
        iconStyle["--icon-color"] = `rgb(${color})`;
        iconStyle["--shape-color"] = `rgba(${color}, 0.2)`;

        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!available}
                .icon=${icon}
                style=${styleMap(iconStyle)}
            ></mushroom-shape-icon>
        `;
    }

    private renderNextControlButton(): TemplateResult | null {
        if (!this._nextControl || this._nextControl == this._activeControl) return null;

        return html`
            <mushroom-button
                .icon=${CONTROLS_ICONS[this._nextControl]}
                @click=${this._onNextControlTap}
            />
        `;
    }

    private renderActiveControl(entity: HassEntity, layout?: Layout): TemplateResult | null {
        switch (this._activeControl) {
            case "buttons_control":
                return html`
                    <mushroom-cover-buttons-control
                        .hass=${this.hass}
                        .entity=${entity}
                        .fill=${layout !== "horizontal"}
                    />
                `;
            case "position_control":
                const color = getStateColor(entity as CoverEntity);
                const sliderStyle = {};
                sliderStyle["--slider-color"] = `rgb(${color})`;
                sliderStyle["--slider-bg-color"] = `rgba(${color}, 0.2)`;

                return html`
                    <mushroom-cover-position-control
                        .hass=${this.hass}
                        .entity=${entity}
                        @current-change=${this.onCurrentPositionChange}
                        style=${styleMap(sliderStyle)}
                    />
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
                    --icon-color: rgb(var(--rgb-state-cover));
                    --shape-color: rgba(var(--rgb-state-cover), 0.2);
                }
                mushroom-cover-buttons-control,
                mushroom-cover-position-control {
                    flex: 1;
                }
            `,
        ];
    }
}
