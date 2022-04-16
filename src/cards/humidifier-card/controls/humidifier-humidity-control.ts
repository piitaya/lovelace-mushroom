import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { isActive, isAvailable } from "../../../ha/data/entity";
import { HumidifierEntity } from "../../../ha/data/humidifier";
import "../../../shared/slider";
import { computeRgbColor } from "../../../utils/colors";

@customElement("mushroom-humidifier-humidity-control")
export class HumidifierHumidityControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HumidifierEntity;

    @property({ attribute: false }) public color!: string | undefined;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this.hass.callService("humidifier", "set_humidity", {
            entity_id: this.entity.entity_id,
            humidity: value,
        });
    }

    protected render(): TemplateResult {
        const max = this.entity.attributes.max_humidity || 100;
        const min = this.entity.attributes.min_humidity || 0;

        let sliderStyle = {
            "--main-color": "rgb(var(--rgb-state-humidifier));",
            "--bg-color": "rgba(var(--rgb-state-humidifier), 0.2);",
        };

        if (this.color) {
            const rgbColor = computeRgbColor(this.color);
            sliderStyle["--main-color"] = `rgb(${rgbColor})`;
            sliderStyle["--bg-color"] = `rgba(${rgbColor}, 0.2)`;
        }

        return html`<mushroom-slider
            .value=${this.entity.attributes.humidity}
            .disabled=${!isAvailable(this.entity)}
            .inactive=${!isActive(this.entity)}
            .showActive=${true}
            .min=${min}
            .max=${max}
            @change=${this.onChange}
            style=${styleMap(sliderStyle)}
        />`;
    }
}
