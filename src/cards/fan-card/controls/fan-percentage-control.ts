import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, isActive, isAvailable } from "../../../ha";
import "../../../shared/slider";
import { computePercentageStep, getPercentage } from "../utils";

@customElement("mushroom-fan-percentage-control")
export class FanPercentageControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: HassEntity;

  onChange(e: CustomEvent<{ value: number }>): void {
    const value = e.detail.value;
    this.hass.callService("fan", "set_percentage", {
      entity_id: this.entity.entity_id,
      percentage: value,
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
    const percentage = getPercentage(this.entity);

    return html`
      <mushroom-slider
        .value=${percentage}
        .disabled=${!isAvailable(this.entity)}
        .inactive=${!isActive(this.entity)}
        .showActive=${true}
        @change=${this.onChange}
        @current-change=${this.onCurrentChange}
        step=${computePercentageStep(this.entity)}
      />
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      mushroom-slider {
        --main-color: rgb(var(--rgb-state-fan));
        --bg-color: rgba(var(--rgb-state-fan), 0.2);
      }
    `;
  }
}
