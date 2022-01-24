import {
    ActionConfig,
    fireEvent,
    HomeAssistant,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { array, assert, assign, object, optional, string } from "superstruct";
import {
    baseLovelaceCardConfig,
    configElementStyle,
} from "../../utils/editor-styles";
import {
    ALARM_CONTROl_PANEL_CARD_EDITOR_NAME,
    ALARM_CONTROl_PANEL_ENTITY_DOMAINS,
} from "./const";
import { AlarmControlPanelCardConfig } from "./alarm-control-panel-card";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { actionConfigStruct } from "../../utils/action-struct";

const DOMAINS = [...ALARM_CONTROl_PANEL_ENTITY_DOMAINS, "group"];

const cardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: string(),
        name: optional(string()),
        states: optional(array()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
    })
);

const actions = ["more-info", "navigate", "url", "call-service", "none"];

/*
 * Ref: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-alarm-panel-card-editor.ts
 */

@customElement(ALARM_CONTROl_PANEL_CARD_EDITOR_NAME)
export class SwitchCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: AlarmControlPanelCardConfig;

    public setConfig(config: AlarmControlPanelCardConfig): void {
        assert(config, cardConfigStruct);
        this._config = config;
    }

    get _entity(): string {
        return this._config!.entity || "";
    }

    get _name(): string {
        return this._config!.name || "";
    }

    get _states(): string[] {
        return this._config!.states || [];
    }

    get _tap_action(): ActionConfig | undefined {
        return this._config!.tap_action;
    }

    get _hold_action(): ActionConfig | undefined {
        return this._config!.hold_action;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const states = [
            "armed_home",
            "armed_away",
            "armed_night",
            "armed_vacation",
            "armed_custom_bypass",
        ];

        return html`
            <div class="card-config">
                <ha-entity-picker
                    .label="${this.hass.localize(
                        "ui.panel.lovelace.editor.card.generic.entity"
                    )}"
                    .hass=${this.hass}
                    .value=${this._entity}
                    .configValue=${"entity"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${DOMAINS}
                    allow-custom-entity
                ></ha-entity-picker>
                <div class="side-by-side">
                    <paper-input
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.name"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .value=${this._name}
                        .configValue=${"name"}
                        @value-changed=${this._valueChanged}
                    ></paper-input>
                </div>
                <div class="side-by-side">
                    <div>
                        <span>Used States</span> ${this._states.map(
                            (entityState, index) => html`
                                <div class="states">
                                    <paper-item>${entityState}</paper-item>
                                    <ha-icon
                                        class="deleteState"
                                        .value=${index}
                                        icon="mdi:close"
                                        @click=${this._stateRemoved}
                                    />
                                </div>
                            `
                        )}
                        <paper-dropdown-menu
                            .label=${this.hass.localize(
                                "ui.panel.lovelace.editor.card.alarm-panel.available_states"
                            )}
                            @value-changed=${this._stateAdded}
                        >
                            <paper-listbox slot="dropdown-content">
                                ${states.map(
                                    (entityState) =>
                                        html` <paper-item
                                            >${entityState}</paper-item
                                        >`
                                )}
                            </paper-listbox>
                        </paper-dropdown-menu>
                    </div>
                </div>
                <div class="side-by-side">
                    <hui-action-editor
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.tap_action"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .hass=${this.hass}
                        .config=${this._tap_action}
                        .actions=${actions}
                        .configValue=${"tap_action"}
                        .tooltipText=${this.hass.localize(
                            "ui.panel.lovelace.editor.card.button.default_action_help"
                        )}
                        @value-changed=${this._valueChanged}
                    ></hui-action-editor>
                    <hui-action-editor
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.hold_action"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .hass=${this.hass}
                        .config=${this._hold_action}
                        .actions=${actions}
                        .configValue=${"hold_action"}
                        .tooltipText=${this.hass.localize(
                            "ui.panel.lovelace.editor.card.button.default_action_help"
                        )}
                        @value-changed=${this._valueChanged}
                    ></hui-action-editor>
                </div>
            </div>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        const value =
            target.checked !== undefined ? target.checked : ev.detail.value;

        if (this[`_${target.configValue}`] === value) {
            return;
        }

        let newConfig;
        if (target.configValue) {
            if (!value) {
                newConfig = { ...this._config };
                delete newConfig[target.configValue!];
            } else {
                newConfig = {
                    ...this._config,
                    [target.configValue!]: value,
                };
            }
        }
        fireEvent(this, "config-changed", { config: newConfig });
    }

    private _stateRemoved(ev: CustomEvent): void {
        if (!this._config || !this._states || !this.hass) {
            return;
        }

        const target = ev.target! as EditorTarget;
        const index = Number(target.value);
        if (index > -1) {
            const newStates = [...this._states];
            newStates.splice(index, 1);
            fireEvent(this, "config-changed", {
                config: {
                    ...this._config,
                    states: newStates,
                },
            });
        }
    }

    private _stateAdded(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        if (!target.value || this._states.indexOf(target.value) !== -1) {
            return;
        }
        const newStates = [...this._states];
        newStates.push(target.value);
        target.value = "";
        fireEvent(this, "config-changed", {
            config: {
                ...this._config,
                states: newStates,
            },
        });
    }

    static get styles(): CSSResultGroup {
        return [
            configElementStyle,
            css`
                .states {
                    display: flex;
                    flex-direction: row;
                }
                .deleteState {
                    visibility: hidden;
                }
                .states:hover > .deleteState {
                    visibility: visible;
                }
                ha-icon {
                    padding-top: 12px;
                }
            `,
        ];
    }
}
