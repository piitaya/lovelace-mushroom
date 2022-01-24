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
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/state-item";
import "../../shared/button";
import { registerCustomCard } from "../../utils/custom-cards";
import {
    COVER_CARD_EDITOR_NAME,
    COVER_CARD_NAME,
    COVER_ENTITY_DOMAINS,
} from "./const";
import "./controls/cover-buttons-control";
import "./controls/cover-position-control";
import "./cover-card-editor";
import { HassEntity } from "home-assistant-js-websocket";
import { getPosition, isActive } from "./utils";
import { actionHandler } from "../../utils/directives/action-handler-directive";

type CoverCardControl = "buttons_control" | "position_control";

const CONTROLS_ICONS: Record<CoverCardControl, string> = {
    buttons_control: "mdi:gesture-tap-button",
    position_control: "mdi:gesture-swipe-horizontal",
};

export interface CoverCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    name?: string;
    show_buttons_control?: false;
    show_position_control?: false;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
}

registerCustomCard({
    type: COVER_CARD_NAME,
    name: "Mushroom Cover Card",
    description: "Card for cover entity",
});

@customElement(COVER_CARD_NAME)
export class CoverCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            COVER_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<CoverCardConfig> {
        const entities = Object.keys(hass.states);
        const covers = entities.filter((e) =>
            COVER_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${COVER_CARD_NAME}`,
            entity: covers[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: CoverCardConfig;

    @state() private _activeControl?: CoverCardControl;

    @state() private _controls: CoverCardControl[] = [];

    get _nextControl(): CoverCardControl | undefined {
        if (this._activeControl) {
            return (
                this._controls[
                    this._controls.indexOf(this._activeControl) + 1
                ] ?? this._controls[0]
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

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale
        );

        const position = getPosition(entity);

        let stateValue = `${stateDisplay}`;
        if (position) {
            stateValue += ` - ${position}%`;
        }

        return html`
            <ha-card>
                <mushroom-state-item
                    .icon=${icon}
                    .name=${name}
                    .value=${stateValue}
                    .active=${isActive(entity)}
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this._config.hold_action),
                    })}
                ></mushroom-state-item>
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
        if (!this._nextControl || this._nextControl == this._activeControl)
            return null;

        return html`
            <mushroom-button
                .icon=${CONTROLS_ICONS[this._nextControl]}
                @click=${this._onNextControlTap}
            />
        `;
    }

    private renderActiveControl(entity: HassEntity): TemplateResult | null {
        switch (this._activeControl) {
            case "buttons_control":
                return html`
                    <mushroom-cover-buttons-control
                        .hass=${this.hass}
                        .entity=${entity}
                    />
                `;
            case "position_control":
                return html`
                    <mushroom-cover-position-control
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
                --rgb-color: 61, 90, 254;
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
                --icon-main-color: rgba(var(--rgb-color), 1);
                --icon-shape-color: rgba(var(--rgb-color), 0.2);
            }
            mushroom-cover-buttons-control,
            mushroom-cover-position-control {
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
