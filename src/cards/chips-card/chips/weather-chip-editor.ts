import {
    computeRTLDirection,
    fireEvent,
    HomeAssistant,
} from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { configElementStyle } from "../../../utils/editor-styles";
import { WeatherChipConfig } from "../../../utils/lovelace/chip/types";
import { EditorTarget } from "../../../utils/lovelace/editor/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { computeChipEditorComponentName } from "../utils";

const DOMAINS = ["weather"];

@customElement(computeChipEditorComponentName("weather"))
export class LightCardEditor extends LitElement implements LovelaceChipEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: WeatherChipConfig;

    public setConfig(config: WeatherChipConfig): void {
        this._config = config;
    }

    get _entity(): string {
        return this._config!.entity || "";
    }

    get _showConditions(): boolean {
        return this._config!.show_conditions ?? false;
    }

    get _showTemperature(): boolean {
        return this._config!.show_temperature ?? false;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const dir = computeRTLDirection(this.hass);

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
                    <ha-formfield label="Show temperature ?" .dir=${dir}>
                        <ha-switch
                            .checked=${this._showTemperature != false}
                            .configValue=${"show_temperature"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield label="Show conditions ?" .dir=${dir}>
                        <ha-switch
                            .checked=${this._showConditions != false}
                            .configValue=${"show_conditions"}
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
