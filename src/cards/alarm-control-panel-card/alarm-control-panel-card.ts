import {
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { getLayoutFromConfig } from "../../utils/layout";
import { AlarmControlPanelCardConfig } from "./alarm-control-panel-card-config";
import "./alarm-control-panel-card-editor";
import {
    ALARM_CONTROl_PANEL_CARD_EDITOR_NAME,
    ALARM_CONTROl_PANEL_CARD_NAME,
    ALARM_CONTROl_PANEL_ENTITY_DOMAINS,
} from "./const";
import {
    getStateColor,
    getStateIcon,
    getStateService,
    isActionsAvailable,
    isDisarmed,
    shouldPulse,
} from "./utils";

registerCustomCard({
    type: ALARM_CONTROl_PANEL_CARD_NAME,
    name: "Mushroom Alarm Control Panel Card",
    description: "Card for alarm control panel",
});

type ActionButtonType = {
    state: string;
    disabled?: boolean;
};

const BUTTONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "clear"];

/*
 * Ref: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-alarm-panel-card.ts
 * TODO: customize icon for modes (advanced YAML configuration)
 */

@customElement(ALARM_CONTROl_PANEL_CARD_NAME)
export class AlarmControlPanelCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(ALARM_CONTROl_PANEL_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<AlarmControlPanelCardConfig> {
        const entities = Object.keys(hass.states);
        const panels = entities.filter((e) =>
            ALARM_CONTROl_PANEL_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${ALARM_CONTROl_PANEL_CARD_NAME}`,
            entity: panels[0],
            states: ["armed_home", "armed_away"],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: AlarmControlPanelCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: AlarmControlPanelCardConfig): void {
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
    }

    private _onTap(e: MouseEvent, state: string): void {
        const service = getStateService(state);
        if (!service) return;
        e.stopPropagation();
        this.hass.callService("alarm_control_panel", service, {
            entity_id: this._config?.entity,
        });
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

        const name = this._config.name ?? entity.attributes.friendly_name;
        const icon = this._config.icon ?? getStateIcon(entity.state);
        const color = getStateColor(entity.state);
        const shapePulse = shouldPulse(entity.state);
        const layout = getLayoutFromConfig(this._config);

        const hideState = this._config.hide_state;

        const actions: ActionButtonType[] =
            this._config.states && this._config.states.length > 0
                ? isDisarmed(entity)
                    ? this._config.states.map((state) => ({ state }))
                    : [{ state: "disarmed" }]
                : [];

        const isActionEnabled = isActionsAvailable(entity);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const iconStyle = {
            "--icon-color": `rgb(${color})`,
            "--shape-color": `rgba(${color}, 0.2)`,
        };

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
                        style=${styleMap(iconStyle)}
                        class=${classMap({
                            pulse: shapePulse,
                        })}
                        .icon=${icon}
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
                        .secondary=${!hideState && stateDisplay}
                    ></mushroom-state-info>
                </mushroom-state-item>
                ${actions.length > 0
                    ? html`<div
                          class=${classMap({
                              actions: true,
                              fill: layout !== "horizontal",
                          })}
                      >
                          ${actions.map(
                              (action) => html`
                                  <mushroom-button
                                      icon=${getStateIcon(action.state)}
                                      @click=${(e) => this._onTap(e, action.state)}
                                      .disabled=${!isActionEnabled}
                                  ></mushroom-button>
                              `
                          )}
                      </div>`
                    : null}
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
                .alert {
                    --main-color: var(--warning-color);
                }
                mushroom-shape-icon.pulse {
                    --shape-animation: 1s ease 0s infinite normal none running pulse;
                }
                .actions.fill mushroom-button {
                    flex: 1;
                }
            `,
        ];
    }
}
