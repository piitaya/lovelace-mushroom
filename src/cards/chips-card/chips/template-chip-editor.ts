import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import setupCustomLocalize from "../../../localize";
import { configElementStyle } from "../../../utils/editor-styles";
import { TemplateChipConfig } from "../../../utils/lovelace/chip/types";
import { EditorTarget } from "../../../utils/lovelace/editor/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { computeChipEditorComponentName } from "../utils";

const actions = ["navigate", "url", "call-service", "none"];

@customElement(computeChipEditorComponentName("template"))
export class EntityChipEditor extends LitElement implements LovelaceChipEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: TemplateChipConfig;

    public setConfig(config: TemplateChipConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const customLocalize = setupCustomLocalize(this.hass);

        return html`
            <div class="card-config">
                <paper-textarea
                    .label="${customLocalize(
                        "editor.chip.template.content"
                    )} (${this.hass.localize(
                        "ui.panel.lovelace.editor.card.config.optional"
                    )})"
                    .value=${this._config.content}
                    .configValue=${"content"}
                    @keydown=${this._ignoreKeydown}
                    @value-changed=${this._valueChanged}
                    autocapitalize="none"
                    autocomplete="off"
                    spellcheck="false"
                ></paper-textarea>
                <paper-textarea
                    .label="${this.hass.localize(
                        "ui.panel.lovelace.editor.card.generic.icon"
                    )} (${this.hass.localize(
                        "ui.panel.lovelace.editor.card.config.optional"
                    )})"
                    .value=${this._config.icon}
                    .configValue=${"icon"}
                    @keydown=${this._ignoreKeydown}
                    @value-changed=${this._valueChanged}
                    autocapitalize="none"
                    autocomplete="off"
                    spellcheck="false"
                ></paper-textarea>
                <paper-textarea
                    .label="${customLocalize(
                        "editor.card.generic.icon_color"
                    )} (${this.hass.localize(
                        "ui.panel.lovelace.editor.card.config.optional"
                    )})"
                    .value=${this._config.icon_color}
                    .configValue=${"icon_color"}
                    @keydown=${this._ignoreKeydown}
                    @value-changed=${this._valueChanged}
                    autocapitalize="none"
                    autocomplete="off"
                    spellcheck="false"
                ></paper-textarea>
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

    private _ignoreKeydown(ev: KeyboardEvent) {
        // Stop keyboard events from the paper-textarea from propagating to avoid accidentally closing the dialog when the user presses Enter.
        ev.stopPropagation();
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
