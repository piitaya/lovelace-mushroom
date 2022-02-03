import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import setupCustomlocalize from "../../../localize";
import {
    COLORS,
    computeColorName,
    computeRgbColor,
} from "../../../utils/colors";
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

        const customLocalize = setupCustomlocalize(this.hass);

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
                    <paper-dropdown-menu
                        .label="${customLocalize(
                            "editor.card.generic.icon_color"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                    >
                        <paper-listbox
                            slot="dropdown-content"
                            attr-for-selected="value"
                            .selected=${this._config.icon_color ?? ""}
                            .configValue=${"icon_color"}
                            @iron-select=${this._valueChanged}
                        >
                            <paper-item value=""
                                >${customLocalize(
                                    "editor.card.generic.color_values.default"
                                )}</paper-item
                            >
                            ${COLORS.map(
                                (color) => html`
                                    <paper-item .value=${color}>
                                        ${this.renderColorCircle(color)}
                                        ${computeColorName(color)}
                                    </paper-item>
                                `
                            )}
                        </paper-listbox>
                    </paper-dropdown-menu>
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

    private renderColorCircle(color: string) {
        return html` <span
            class="circle-color"
            style=${styleMap({
                "--main-color": computeRgbColor(color),
            })}
        ></span>`;
    }

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        const value =
            target.checked ?? ev.detail.value ?? ev.detail.item?.value;

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

    static get styles(): CSSResultGroup {
        return configElementStyle;
    }
}
