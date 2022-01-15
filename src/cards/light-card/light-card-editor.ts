import {
    computeRTLDirection,
    fireEvent,
    HomeAssistant,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert, assign, boolean, object, optional, string } from "superstruct";
import {
    baseLovelaceCardConfig,
    configElementStyle,
    EditorTarget,
} from "../../utils/editor";
import { LIGHT_CARD_EDITOR_NAME } from "./const";
import { LightCardConfig } from "./light-card";

const DOMAINS = ["light"];

const cardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: string(),
        icon: optional(string()),
        name: optional(string()),
        show_brightness_control: optional(boolean()),
        show_color_temp_control: optional(boolean()),
    })
);

@customElement(LIGHT_CARD_EDITOR_NAME)
export class LightCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: LightCardConfig;

    public setConfig(config: LightCardConfig): void {
        assert(config, cardConfigStruct);
        this._config = config;
    }

    get _entity(): string {
        return this._config!.entity || "";
    }

    get _name(): string {
        return this._config!.name || "";
    }

    get _icon(): string {
        return this._config!.icon || "";
    }

    get _showBrightnessControl(): boolean {
        return this._config!.show_brightness_control ?? false;
    }

    get _showColorTempControl(): boolean {
        return this._config!.show_color_temp_control ?? false;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const dir = computeRTLDirection(this.hass);
        const entityState = this.hass.states[this._entity];

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
                    <ha-icon-picker
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.icon"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .value=${this._icon}
                        .placeholder=${this._icon || stateIcon(entityState)}
                        .configValue=${"icon"}
                        @value-changed=${this._valueChanged}
                    ></ha-icon-picker>
                </div>
                <div class="side-by-side">
                    <ha-formfield label="Show brightness control ?" .dir=${dir}>
                        <ha-switch
                            .checked=${this._showBrightnessControl != false}
                            .configValue=${"show_brightness_control"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield label="Show color temp control ?" .dir=${dir}>
                        <ha-switch
                            .checked=${this._showColorTempControl != false}
                            .configValue=${"show_color_temp_control"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
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
