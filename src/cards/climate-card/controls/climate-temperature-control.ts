import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ClimateEntity, computeRTL, HomeAssistant, isAvailable } from "../../../ha";
import "../../../shared/button";
import "../../../shared/button-group";
import "../../../shared/input-number";

export const isTemperatureControlVisible = (entity: ClimateEntity) =>
    entity.attributes.temperature != null ||
    (entity.attributes.target_temp_low != null && entity.attributes.target_temp_high != null);

@customElement("mushroom-climate-temperature-control")
export class ClimateTemperatureControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: ClimateEntity;

    @property() public fill: boolean = false;

    onValueChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this.hass!.callService("climate", "set_temperature", {
            entity_id: this.entity.entity_id,
            temperature: value,
        });
    }

    onLowValueChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this.hass!.callService("climate", "set_temperature", {
            entity_id: this.entity.entity_id,
            target_temp_low: value,
            target_temp_high: this.entity.attributes.target_temp_high,
        });
    }

    onHighValueChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this.hass!.callService("climate", "set_temperature", {
            entity_id: this.entity.entity_id,
            target_temp_low: this.entity.attributes.target_temp_low,
            target_temp_high: value,
        });
    }

    protected render(): TemplateResult {
        const rtl = computeRTL(this.hass);

        const available = isAvailable(this.entity);

        const formatOptions: Intl.NumberFormatOptions =
            this.entity.attributes.target_temp_step === 1
                ? {
                      maximumFractionDigits: 0,
                  }
                : {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                  };

        return html`
            <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
                ${this.entity.attributes.temperature != null
                    ? html`
                          <mushroom-input-number
                              .locale=${this.hass.locale}
                              .value=${this.entity.attributes.temperature}
                              .step=${this.entity.attributes.target_temp_step}
                              .min=${this.entity.attributes.min_temp}
                              .max=${this.entity.attributes.max_temp}
                              .disabled=${!available}
                              .formatOptions=${formatOptions}
                              @change=${this.onValueChange}
                          ></mushroom-input-number>
                      `
                    : null}
                ${this.entity.attributes.target_temp_low != null &&
                this.entity.attributes.target_temp_high != null
                    ? html`
                          <mushroom-input-number
                              .locale=${this.hass.locale}
                              .value=${this.entity.attributes.target_temp_low}
                              .step=${this.entity.attributes.target_temp_step}
                              .min=${this.entity.attributes.min_temp}
                              .max=${this.entity.attributes.max_temp}
                              .disabled=${!available}
                              .formatOptions=${formatOptions}
                              @change=${this.onLowValueChange}
                          ></mushroom-input-number
                          ><mushroom-input-number
                              .locale=${this.hass.locale}
                              .value=${this.entity.attributes.target_temp_high}
                              .step=${this.entity.attributes.target_temp_step}
                              .min=${this.entity.attributes.min_temp}
                              .max=${this.entity.attributes.max_temp}
                              .disabled=${!available}
                              .formatOptions=${formatOptions}
                              @change=${this.onHighValueChange}
                          ></mushroom-input-number>
                      `
                    : null}
            </mushroom-button-group>
        `;
    }
}
