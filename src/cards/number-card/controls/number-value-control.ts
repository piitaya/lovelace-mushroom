import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, isActive, isAvailable } from "../../../ha";
import "../../../shared/slider";

@customElement("mushroom-number-value-control")
export class NumberValueControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        const domain = this.entity.entity_id.split(".")[0];
        this.hass.callService(domain, "set_value", {
            entity_id: this.entity.entity_id,
            value: value,
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
        return html`
            <mushroom-slider
                .value=${this.entity.state}
                .disabled=${!isAvailable(this.entity)}
                .inactive=${!isActive(this.entity)}
                .showActive=${true}
                .min=${this.entity.attributes.min}
                .max=${this.entity.attributes.max}
                .step=${this.entity.attributes.step}
                @change=${this.onChange}
                @current-change=${this.onCurrentChange}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-slider {
                --main-color: rgb(var(--rgb-state-number));
                --bg-color: rgba(var(--rgb-state-number), 0.2);
            }
        `;
    }
}
