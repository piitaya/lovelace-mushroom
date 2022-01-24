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
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { customElement, property, state, query } from "lit/decorators.js";
import "../../shared/state-item";
import { registerCustomCard } from "../../utils/custom-cards";
import {
    ALARM_CONTROl_PANEL_CARD_EDITOR_NAME,
    ALARM_CONTROl_PANEL_CARD_NAME,
    ALARM_CONTROL_PANEL_CARD_STATE_ICON,
    ALARM_CONTROL_PANEL_CARD_STATE_SERVICE,
    ALARM_CONTROl_PANEL_ENTITY_DOMAINS,
} from "./const";
import "./alarm-control-panel-card-editor";
import type { PaperInputElement } from "@polymer/paper-input/paper-input";
import { actionHandler } from "../../utils/directives/action-handler-directive";

export interface AlarmControlPanelCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    name?: string;
    states?: string[];
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
}

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
        return document.createElement(
            ALARM_CONTROl_PANEL_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<AlarmControlPanelCardConfig> {
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

    @query("#alarmCode") private _input?: PaperInputElement;

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
            ...config,
        };
    }

    private _onTap(e: MouseEvent, service: string): void {
        e.stopPropagation();
        const code = this._input?.value || undefined;
        this.hass.callService("alarm_control_panel", service, {
            entity_id: this._config?.entity,
            code,
        });
        this._input!.value = "";
    }

    private _handlePadClick(e: MouseEvent): void {
        const val = (e.currentTarget! as any).value;
        this._input!.value = val === "clear" ? "" : this._input!.value + val;
    }

    private get _isGroup() {
        return !!this._config?.entity.startsWith("group.");
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const entity = this._config.entity;
        const panels = this._isGroup
            ? this.hass.states[entity].attributes.entity_id
            : [entity];
        const [ref_panel] = panels;

        const entity_state = this.hass.states[entity];
        const panel_state = this.hass.states[ref_panel];

        let has_alert = panel_state.state.startsWith("partially_");
        panels.forEach((element) => {
            has_alert =
                has_alert ||
                this.hass.states[element].state !== panel_state.state;
        });

        const name = this._config.name ?? entity_state.attributes.friendly_name;
        const icon =
            ALARM_CONTROL_PANEL_CARD_STATE_ICON[panel_state.state] ||
            "mdi:shield-lock-outline";
        let state_color = {
            disarmed: "var(--rgb-alarm-state-color-disarmed)",
            armed: "var(--rgb-alarm-state-color-armed)",
            triggered: "var(--rgb-alarm-state-color-triggered)",
            unavailable: "var(--rgb-alarm-state-color-warning)",
        };
        const color =
            state_color[panel_state.state.split("_")[0]] ||
            "var(--rgb-alarm-state-color-default)";
        const shape_pulse =
            ["arming", "triggered", "pending", "unavailable"].indexOf(
                panel_state.state
            ) >= 0;
        let buttons: ActionButtonType[] = [{ state: "disarmed" }];
        if (panel_state.state === "disarmed") {
            buttons = this._config.states?.map((state) => ({ state })) || [];
        }
        if (["pending", "unavailable"].indexOf(panel_state.state) >= 0) {
            buttons.forEach((b) => {
                b.disabled = true;
            });
        }

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            panel_state,
            this.hass.locale
        );

        return html`<ha-card>
            <mushroom-state-item
                class="${panel_state.state}"
                style=${styleMap({
                    "--icon-main-color": `rgb(${color})`,
                    "--icon-shape-color": `rgba(${color}, 0.2)`,
                    "--badge-main-color": "var(--warning-color)",
                })}
                .icon=${icon}
                .name=${name}
                .value=${stateDisplay}
                .active=${true}
                .shape_pulse=${shape_pulse}
                .badge_icon=${has_alert ? "mdi:exclamation" : undefined}
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(this._config.hold_action),
                })}
            ></mushroom-state-item>
            <div class="actions">
                ${buttons.map(
                    (b) => html`<mushroom-button
                        icon=${ALARM_CONTROL_PANEL_CARD_STATE_ICON[b.state]}
                        @click=${(e) =>
                            this._onTap(
                                e,
                                ALARM_CONTROL_PANEL_CARD_STATE_SERVICE[b.state]
                            )}
                        .disabled=${!!b.disabled}
                    ></mushroom-button>`
                )}
            </div>
            ${!panel_state.attributes.code_format
                ? html``
                : html`<paper-input
                      id="alarmCode"
                      .label=${this.hass.localize(
                          "ui.card.alarm_control_panel.code"
                      )}
                      type="password"
                      .inputmode=${panel_state.attributes.code_format ===
                      "number"
                          ? "numeric"
                          : "text"}
                  ></paper-input>`}
            ${panel_state.attributes.code_format !== "number"
                ? html``
                : html`<div id="keypad">
                      ${BUTTONS.map((value) =>
                          value === ""
                              ? html` <mwc-button disabled></mwc-button> `
                              : html`
                                    <mwc-button
                                        .value=${value}
                                        @click=${this._handlePadClick}
                                        outlined
                                        class=${classMap({
                                            numberkey: value !== "clear",
                                        })}
                                    >
                                        ${value === "clear"
                                            ? this.hass!.localize(
                                                  `ui.card.alarm_control_panel.clear_code`
                                              )
                                            : value}
                                    </mwc-button>
                                `
                      )}
                  </div> `}
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        // Defalt colors are RGB values of HASS --label-badge-*
        return css`
            :host {
                --rgb-alarm-state-color-default: var(--rgb-primary-text-color);
                --rgb-alarm-state-color-warning: 240, 180, 0;
                --rgb-alarm-state-color-disarmed: 3, 155, 229;
                --rgb-alarm-state-color-armed: 13, 160, 53;
                --rgb-alarm-state-color-triggered: 223, 76, 30;
            }
            ha-card {
                display: flex;
                flex-direction: column;
                padding: 12px;
            }
            mushroom-state-item {
                cursor: pointer;
            }
            ha-card > *:not(:last-child) {
                margin-bottom: 12px;
            }
            .actions {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
            }
            .actions *:not(:last-child) {
                margin-right: 12px;
            }
            .actions mushroom-button {
                flex: 1;
            }
            paper-input {
                margin: 0 auto 8px;
                max-width: 150px;
                text-align: center;
            }
            #keypad {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                margin: auto;
                width: 100%;
                max-width: 300px;
            }
            #keypad mwc-button {
                padding: 8px;
                width: 30%;
                box-sizing: border-box;
            }
        `;
    }
}
