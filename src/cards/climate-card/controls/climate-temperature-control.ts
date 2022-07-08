import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
    ClimateEntity,
    computeRTL,
    conditionalClamp,
    debounce,
    formatNumber,
    HomeAssistant,
    isAvailable,
    round,
} from "../../../ha";
import "../../../shared/button";
import "../../../shared/button-group";
import "./buttons/temperature-button";

@customElement("mushroom-climate-temperature-control")
export class CoverTemperatureControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: ClimateEntity;

    @property() public fill: boolean = false;

    @state()
    value?: number;

    @state()
    pending: boolean = false;

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (changedProperties.has("entity")) {
            if (this.entity.attributes.temperature != this.value) {
                this.value = this.entity.attributes.temperature;
            }
        }
    }

    private _incrementValue(e: MouseEvent) {
        e.stopPropagation();
        if (!this.value) return;
        const value = this.value;
        const step = this.entity.attributes.target_temp_step ?? 1;

        const newValue = round(value + step, 1);
        this._processNewValue(newValue);
    }

    private _decrementValue(e: MouseEvent) {
        e.stopPropagation();
        if (!this.value) return;
        const value = this.value;
        const step = this.entity.attributes.target_temp_step ?? 1;
        const newValue = round(value - step, 1);
        this._processNewValue(newValue);
    }

    private debounceCallService = debounce((value: number) => {
        this.callService(value);
        this.pending = false;
    }, 2000);

    private _processNewValue(value) {
        const newValue = conditionalClamp(
            value,
            this.entity.attributes.min_temp,
            this.entity.attributes.max_temp
        );
        if (this.value !== newValue) {
            this.value = newValue;
            this.pending = true;
        }

        this.debounceCallService(newValue);
    }

    callService(value: number) {
        this.hass!.callService("climate", "set_temperature", {
            entity_id: this.entity.entity_id,
            temperature: value,
        });
    }

    protected render(): TemplateResult {
        const rtl = computeRTL(this.hass);

        const available = isAvailable(this.entity);

        const options: Intl.NumberFormatOptions =
            this.entity.attributes.target_temp_step === 1
                ? {
                      maximumFractionDigits: 0,
                  }
                : {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                  };

        const value =
            this.value != null ? formatNumber(this.value, this.hass.locale, options) : "-";

        return html`
            <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
                <mushroom-button
                    icon="mdi:minus"
                    @click=${this._decrementValue}
                    .disabled=${!available ||
                    this.value == null ||
                    this.value <= this.entity.attributes.min_temp}
                ></mushroom-button>

                <mushroom-temperature-button
                    .value=${value}
                    .pending=${this.pending}
                    .disabled=${!available}
                ></mushroom-temperature-button>

                <mushroom-button
                    icon="mdi:plus"
                    @click=${this._incrementValue}
                    .disabled=${!available ||
                    this.value == null ||
                    this.value >= this.entity.attributes.max_temp}
                ></mushroom-button>
            </mushroom-button-group>
        `;
    }
}
