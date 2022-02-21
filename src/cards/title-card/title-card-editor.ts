import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { configElementStyle } from "../../utils/editor-styles";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { TITLE_CARD_EDITOR_NAME } from "./const";
import { TitleCardConfig, titleCardConfigStruct } from "./title-card-config";

@customElement(TITLE_CARD_EDITOR_NAME)
export class TitleCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: TitleCardConfig;

    public setConfig(config: TitleCardConfig): void {
        assert(config, titleCardConfigStruct);
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <div class="card-config">
                <ha-textarea
                    .label="${customLocalize("editor.card.title.title")} (${this.hass.localize(
                        "ui.panel.lovelace.editor.card.config.optional"
                    )})"
                    .value=${this._config.title ?? ""}
                    .configValue=${"title"}
                    @keydown=${this._ignoreKeydown}
                    @input=${this._valueChanged}
                    dir="ltr"
                    autogrow
                    autocapitalize="none"
                    autocomplete="off"
                    spellcheck="false"
                ></ha-textarea>
                <ha-textarea
                    .label="${customLocalize("editor.card.title.subtitle")} (${this.hass.localize(
                        "ui.panel.lovelace.editor.card.config.optional"
                    )})"
                    .value=${this._config.subtitle ?? ""}
                    .configValue=${"subtitle"}
                    @keydown=${this._ignoreKeydown}
                    @input=${this._valueChanged}
                    dir="ltr"
                    autogrow
                    autocapitalize="none"
                    autocomplete="off"
                    spellcheck="false"
                ></ha-textarea>
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
        const value = target.checked ?? ev.detail.value ?? target.value;

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
