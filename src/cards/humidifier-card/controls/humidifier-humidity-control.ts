import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isActive, isAvailable } from "../../../ha/data/entity";
import { HumidifierEntity } from "../../../ha/data/humidifier";
import { getHumidity } from "../utils";
import "../../../shared/slider";

@customElement("mushroom-humidifier-humidity-control")
export class HumidifierHumidityControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HumidifierEntity;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this.hass.callService("humidifier", "set_humidity", {
            entity_id: this.entity.entity_id,
            humidity: value,
        });
    }

    protected render(): TemplateResult {
        const humidity = getHumidity(this.entity);

        return html`<mushroom-slider
            .value=${humidity}
            .disabled=${!isAvailable(this.entity)}
            .inactive=${!isActive(this.entity)}
            .showActive=${true}
            @change=${this.onChange}
        />`;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-slider {
                --main-color: rgb(var(--rgb-state-humidifier));
                --bg-color: rgba(var(--rgb-state-humidifier), 0.2);
            }
        `;
    }
}
