import {
    computeRTLDirection,
    fireEvent,
    HomeAssistant,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { configElementStyle } from "../../utils/editor-styles";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { TEMPLATE_CARD_EDITOR_NAME } from "./const";
import {
    TemplateCardConfig,
    templateCardConfigStruct,
} from "./template-card-config";

const actions = ["navigate", "url", "call-service", "none"];

@customElement(TEMPLATE_CARD_EDITOR_NAME)
export class TemplateCardEditor
    extends LitElement
    implements LovelaceCardEditor
{
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: TemplateCardConfig;

    public setConfig(config: TemplateCardConfig): void {
        assert(config, templateCardConfigStruct);
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const dir = computeRTLDirection(this.hass);
        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <div class="card-config">
                <div class="side-by-side">
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
                </div>
                <paper-textarea
                    .label="${customLocalize(
                        "editor.card.template.primary"
                    )} (${this.hass.localize(
                        "ui.panel.lovelace.editor.card.config.optional"
                    )})"
                    .value=${this._config.primary}
                    .configValue=${"primary"}
                    @keydown=${this._ignoreKeydown}
                    @value-changed=${this._valueChanged}
                    autocapitalize="none"
                    autocomplete="off"
                    spellcheck="false"
                ></paper-textarea>
                <paper-textarea
                    .label="${customLocalize(
                        "editor.card.template.secondary"
                    )} (${this.hass.localize(
                        "ui.panel.lovelace.editor.card.config.optional"
                    )})"
                    .value=${this._config.secondary}
                    .configValue=${"secondary"}
                    @keydown=${this._ignoreKeydown}
                    @value-changed=${this._valueChanged}
                    autocapitalize="none"
                    autocomplete="off"
                    spellcheck="false"
                ></paper-textarea>
                <div class="side-by-side">
                    <ha-formfield
                        .label=${customLocalize("editor.card.generic.vertical")}
                        .dir=${dir}
                    >
                        <ha-switch
                            .checked=${!!this._config.vertical}
                            .configValue=${"vertical"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield
                        .label=${customLocalize("editor.card.generic.multiline_secondary")}
                        .dir=${dir}
                    >
                        <ha-switch
                            .checked=${!!this._config.multiline_secondary}
                            .configValue=${"multiline_secondary"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
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
