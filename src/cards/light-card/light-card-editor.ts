import { computeRTLDirection, fireEvent, HomeAssistant, LovelaceCardEditor, stateIcon } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { configElementStyle } from "../../utils/editor-styles";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { LIGHT_CARD_EDITOR_NAME, LIGHT_ENTITY_DOMAINS } from "./const";
import { LightCardConfig, lightCardConfigStruct } from "./light-card-config";

const actions = ["toggle", "more-info", "navigate", "url", "call-service", "none"];

@customElement(LIGHT_CARD_EDITOR_NAME)
export class LightCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: LightCardConfig;

    public setConfig(config: LightCardConfig): void {
        assert(config, lightCardConfigStruct);
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const dir = computeRTLDirection(this.hass);
        const entityState = this._config.entity ? this.hass.states[this._config.entity] : undefined;
        const entityIcon = entityState ? stateIcon(entityState) : undefined;

        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <div class="card-config">
                <ha-entity-picker
                    .label="${this.hass.localize("ui.panel.lovelace.editor.card.generic.entity")}"
                    .hass=${this.hass}
                    .value=${this._config.entity}
                    .configValue=${"entity"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${LIGHT_ENTITY_DOMAINS}
                    allow-custom-entity
                ></ha-entity-picker>
                <div class="side-by-side">
                    <paper-input
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.name"
                        )} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
                        .value=${this._config.name}
                        .configValue=${"name"}
                        @value-changed=${this._valueChanged}
                    ></paper-input>
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
                    <ha-formfield .label=${customLocalize("editor.card.generic.vertical")} .dir=${dir}>
                        <ha-switch
                            .checked=${!!this._config.vertical}
                            .configValue=${"vertical"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield .label=${customLocalize("editor.card.generic.hide_state")} .dir=${dir}>
                        <ha-switch
                            .checked=${!!this._config.hide_state}
                            .configValue=${"hide_state"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                </div>
                <div class="side-by-side">
                    <ha-formfield .label=${customLocalize("editor.card.light.show_brightness_control")} .dir=${dir}>
                        <ha-switch
                            .checked=${!!this._config.show_brightness_control}
                            .configValue=${"show_brightness_control"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield .label=${customLocalize("editor.card.light.use_light_color")} .dir=${dir}>
                        <ha-switch
                            .checked=${!!this._config.use_light_color}
                            .configValue=${"use_light_color"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                </div>
                <div class="side-by-side">
                    <ha-formfield .label=${customLocalize("editor.card.light.show_color_temp_control")} .dir=${dir}>
                        <ha-switch
                            .checked=${!!this._config.show_color_temp_control}
                            .configValue=${"show_color_temp_control"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield .label=${customLocalize("editor.card.light.show_color_control")} .dir=${dir}>
                        <ha-switch
                            .checked=${!!this._config.show_color_control}
                            .configValue=${"show_color_control"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
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
                        .tooltipText=${this.hass.localize("ui.panel.lovelace.editor.card.button.default_action_help")}
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
                        .tooltipText=${this.hass.localize("ui.panel.lovelace.editor.card.button.default_action_help")}
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
        const value = target.checked ?? ev.detail.value ?? ev.detail.item?.value;

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
