import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { HomeAssistant, isActive } from "../../../ha";
import "../../../shared/slider";
import { isOscillating } from "../utils";

@customElement("mushroom-fan-oscillate-control")
export class FanPercentageControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: HassEntity;

  private _onTap(e: MouseEvent): void {
    e.stopPropagation();
    const oscillating = isOscillating(this.entity);

    this.hass.callService("fan", "oscillate", {
      entity_id: this.entity.entity_id,
      oscillating: !oscillating,
    });
  }

  protected render(): TemplateResult {
    const oscillating = isOscillating(this.entity);
    const active = isActive(this.entity);

    return html`
      <mushroom-button
        class=${classMap({ active: oscillating })}
        @click=${this._onTap}
        .disabled=${!active}
      >
        <ha-icon
          .icon=${oscillating
            ? "mdi:arrow-oscillating"
            : "mdi:arrow-oscillating-off"}
        ></ha-icon>
      </mushroom-button>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: flex;
        --control-color: rgb(var(--rgb-state-fan));
        --control-bg-color: rgba(var(--rgb-state-fan), 0.2);
      }
      mushroom-button.active {
        --icon-color: var(--control-color);
        --bg-color: var(--control-bg-color);
      }
    `;
  }
}
