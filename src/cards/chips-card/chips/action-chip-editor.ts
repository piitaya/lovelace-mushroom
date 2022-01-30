import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import setupCustomlocalize from "../../../localize";
import { configElementStyle } from "../../../utils/editor-styles";
import { ActionChipConfig } from "../../../utils/lovelace/chip/types";
import { EditorTarget } from "../../../utils/lovelace/editor/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { computeChipEditorComponentName } from "../utils";

const actions = ["navigate", "url", "call-service", "none"];

@customElement(computeChipEditorComponentName("action"))
export class EntityChipEditor extends LitElement implements LovelaceChipEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: ActionChipConfig;

    public setConfig(config: ActionChipConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const customlocalize = setupCustomlocalize(this.hass);

        return html`
            <div class="card-config">
                <div class="side-by-side">
                    <ha-icon-picker
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.icon"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .value=${this._config.icon}
                        .placeholder=${this._config.icon || "mdi:flash"}
                        .configValue=${"icon"}
                        @value-changed=${this._valueChanged}
                    ></ha-icon-picker>
                    <paper-input
                        .label="${customlocalize(
                            "editor.chip.generic.icon_color"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .value=${this._config.icon_color}
                        .configValue=${"icon_color"}
                        @value-changed=${this._valueChanged}
                    ></paper-input>
                </div>
                <div class="side-by-side">
                    <hui-action-editor
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.tap_action"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
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
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
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

    static get styles(): CSSResultGroup {
        return configElementStyle;
    }
}
