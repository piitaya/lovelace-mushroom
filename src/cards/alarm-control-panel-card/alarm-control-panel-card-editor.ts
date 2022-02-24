import {
    computeRTLDirection,
    fireEvent,
    HomeAssistant,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import "../../shared/editor/layout-picker";
import "../../shared/form/mushroom-select";
import "../../shared/form/mushroom-textfield";
import { configElementStyle } from "../../utils/editor-styles";
import { stateIcon } from "../../utils/icons/state-icon";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import {
    alarmControlPanelCardCardConfigStruct,
    AlarmControlPanelCardConfig,
} from "./alarm-control-panel-card-config";
import { ALARM_CONTROl_PANEL_CARD_EDITOR_NAME, ALARM_CONTROl_PANEL_ENTITY_DOMAINS } from "./const";

const DOMAINS = [...ALARM_CONTROl_PANEL_ENTITY_DOMAINS];

const actions = ["more-info", "navigate", "url", "call-service", "none"];

/*
 * Ref: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-alarm-panel-card-editor.ts
 */
@customElement(ALARM_CONTROl_PANEL_CARD_EDITOR_NAME)
export class SwitchCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: AlarmControlPanelCardConfig;

    public setConfig(config: AlarmControlPanelCardConfig): void {
        assert(config, alarmControlPanelCardCardConfigStruct);
        this._config = config;
    }

    get _states(): string[] {
        return this._config!.states || [];
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const dir = computeRTLDirection(this.hass);
        const entity = this._config.entity ? this.hass.states[this._config.entity] : undefined;
        const entityIcon = entity ? stateIcon(entity) : undefined;

        const states = [
            "armed_home",
            "armed_away",
            "armed_night",
            "armed_vacation",
            "armed_custom_bypass",
        ];

        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <div class="card-config">
                <ha-entity-picker
                    .label="${this.hass.localize("ui.panel.lovelace.editor.card.generic.entity")}"
                    .hass=${this.hass}
                    .value=${this._config.entity}
                    .configValue=${"entity"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${DOMAINS}
                    allow-custom-entity
                ></ha-entity-picker>
                <div class="side-by-side">
                    <mushroom-textfield
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.name"
                        )} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
                        .value=${this._config.name ?? ""}
                        .configValue=${"name"}
                        @input=${this._valueChanged}
                    >
                    </mushroom-textfield>
                    <ha-icon-picker
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.icon"
                        )} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
                        .value=${this._config.icon}
                        .placeholder=${this._config.icon || entityIcon}
                        .configValue=${"icon"}
                        @value-changed=${this._valueChanged}
                    ></ha-icon-picker>
                </div>
                <div class="side-by-side">
                    <mushroom-layout-picker
                        .label="${customLocalize(
                            "editor.card.generic.layout"
                        )} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
                        .hass=${this.hass}
                        .value=${this._config.layout}
                        .configValue=${"layout"}
                        @value-changed=${this._valueChanged}
                    >
                    </mushroom-layout-picker>
                    <ha-formfield
                        .label=${customLocalize("editor.card.generic.hide_state")}
                        .dir=${dir}
                    >
                        <ha-switch
                            .checked=${!!this._config.hide_state}
                            .configValue=${"hide_state"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                </div>
                <div class="side-by-side">
                    <div>
                        <mwc-list>
                            <mwc-list-item noninteractive
                                >${customLocalize(
                                    "editor.card.alarm_control_panel.displayed_states"
                                )}</mwc-list-item
                            >
                            <li divider role="separator"></li>
                            ${this._states.map(
                                (entityState, index) => html`
                                    <mwc-list-item hasMeta>
                                        <span>${entityState}</span>
                                        <ha-icon
                                            class="deleteState"
                                            .value=${index}
                                            icon="mdi:close"
                                            @click=${this._stateRemoved}
                                            slot="meta"
                                        ></ha-icon>
                                    </mwc-list-item>
                                `
                            )}
                        </mwc-list>
                        <mushroom-select
                            .label=${this.hass.localize(
                                "ui.panel.lovelace.editor.card.alarm-panel.available_states"
                            )}
                            @selected=${this._stateAdded}
                            @closed=${(e) => e.stopPropagation()}
                            fixedMenuPosition
                            naturalMenuWidth
                        >
                            ${states.map(
                                (entityState) =>
                                    html`
                                        <mwc-list-item .value=${entityState}>
                                            ${entityState}
                                        </mwc-list-item>
                                    `
                            )}
                        </mushroom-select>
                    </div>
                </div>
                <div class="side-by-side">
                    <hui-action-editor
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.tap_action"
                        )} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
                        .hass=${this.hass}
                        .config=${this._config.tap_action}
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
                        )} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
                        .hass=${this.hass}
                        .config=${this._config.hold_action}
                        .actions=${actions}
                        .configValue=${"hold_action"}
                        .tooltipText=${this.hass.localize(
                            "ui.panel.lovelace.editor.card.button.default_action_help"
                        )}
                        @value-changed=${this._valueChanged}
                    ></hui-action-editor>
                </div>
                <div class="side-by-side">
                    <hui-action-editor
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.double_tap_action"
                        )} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
                        .hass=${this.hass}
                        .config=${this._config.double_tap_action}
                        .actions=${actions}
                        .configValue=${"double_tap_action"}
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
        const value = target.checked ?? ev.detail.value ?? target.value;

        if (!target.configValue || this._config[target.configValue] === value) {
            return;
        }
        if (target.configValue) {
            if (!value) {
                this._config = { ...this._config };
                delete this._config[target.configValue!];
            } else {
                this._config = {
                    ...this._config,
                    [target.configValue!]: value,
                };
            }
        }
        fireEvent(this, "config-changed", { config: this._config });
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
            target.value = "";
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
                mwc-list-item:hover > .deleteState {
                    visibility: visible;
                }
                ha-icon {
                    padding-top: 12px;
                }
            `,
        ];
    }
}
