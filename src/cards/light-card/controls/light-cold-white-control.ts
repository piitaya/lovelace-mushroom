import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, isActive, isAvailable, LightEntity } from "../../../ha";
import "../../../shared/slider";
import { getRGBWWColor, getColdWhite } from "../utils";

@customElement("mushroom-light-cold-white-control")
export class LightColdWhiteControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: LightEntity;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value_pct = e.detail.value;
        const value = Math.round((value_pct / 100) * 255);
        const rgb_color = getRGBWWColor(this.entity)?.slice(0,3);
        const warm_white = getRGBWWColor(this.entity)?.slice(-1);
        const rgbww_color = [...(rgb_color||[0, 0, 0]), value, ...(warm_white||[0])];

        if (rgbww_color?.length === 5) {
            this.hass.callService("light", "turn_on", {
                entity_id: this.entity.entity_id,
                rgbww_color: rgbww_color,
        });}
    }

    protected render(): TemplateResult {
        const cold_white = getColdWhite(this.entity);
        console.log("HERE");

        return html`
            <mushroom-slider
                .value=${cold_white}
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
                --gradient: -webkit-linear-gradient(right, rgb(207, 218, 255) 0%, black 100%);
            }
        `;
    }
}
