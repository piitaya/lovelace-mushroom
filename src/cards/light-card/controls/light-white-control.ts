import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, isActive, isAvailable, LightEntity } from "../../../ha";
import "../../../shared/slider";
import { getRGBWColor, getWhite } from "../utils";

@customElement("mushroom-light-white-control")
export class LightWhiteControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: LightEntity;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value_pct = e.detail.value;
        const value = Math.round((value_pct / 100) * 255);
        const rgb_color = getRGBWColor(this.entity)?.slice(0,3);
        const rgbw_color = [...(rgb_color||[0, 0, 0]), value];

        if (rgbw_color?.length === 4) {
            this.hass.callService("light", "turn_on", {
                entity_id: this.entity.entity_id,
                rgbw_color: rgbw_color,
        });}
    }

    protected render(): TemplateResult {
        const white = getWhite(this.entity);

        return html`
            <mushroom-slider
                .value=${white}
                .disabled=${!isAvailable(this.entity)}
                .inactive=${!isActive(this.entity)}
                .showIndicator=${true}
                @change=${this.onChange}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-slider {
                --gradient: -webkit-linear-gradient(right, rgb(255, 255, 255) 0%, black 100%);
            }
        `;
    }
}
