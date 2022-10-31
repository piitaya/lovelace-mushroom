import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, isActive, isAvailable, LightEntity } from "../../../ha";
import "../../../shared/slider";
import { getWhite } from "../utils";

@customElement("mushroom-light-white-control")
export class LightWhiteControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: LightEntity;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this.hass.callService("light", "turn_on", {
            entity_id: this.entity.entity_id,
            rgbw_color: [this.entity.attributes.rgbw_color[0],this.entity.attributes.rgbw_color[1],this.entity.attributes.rgbw_color[2],value],
        });
    }

    onCurrentChange(e: CustomEvent<{ value?: number }>): void {
        const value = e.detail.value;
        this.dispatchEvent(
            new CustomEvent("current-change", {
                detail: {
                    value,
                },
            })
        );
    }

    protected render(): TemplateResult {
        const white = getWhite(this.entity);

        return html`
            <mushroom-slider
                .value=${white}
                .disabled=${!isAvailable(this.entity)}
                .inactive=${!isActive(this.entity)}
                .min=${0}
                .max=${255}
                .showActive=${true}
                @change=${this.onChange}
                @current-change=${this.onCurrentChange}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --slider-color: rgb(205, 205, 205);
                --slider-outline-color: transparent;
                --slider-bg-color: rgba(51, 51, 51, 0.2);
            }
            mushroom-slider {
                --main-color: var(--slider-color);
                --bg-color: var(--slider-bg-color);
                --main-outline-color: var(--slider-outline-color);
            }
        `;
    }
}
