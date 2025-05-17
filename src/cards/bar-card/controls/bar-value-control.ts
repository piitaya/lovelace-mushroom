import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  getDefaultFormatOptions,
  getNumberFormatOptions,
  HomeAssistant,
  isActive,
  isAvailable,
} from "../../../ha";
import "../../../shared/slider";
import "../../../shared/input-number";
import { BarCardConfig } from "../bar-card-config";

@customElement("mushroom-bar-value-control")
export class BarValueControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: HassEntity;

  @property({ attribute: false }) public config!: BarCardConfig;

  protected render(): TemplateResult {
    const value = Number(this.entity.state);

    const formatOptions =
      getNumberFormatOptions(
        this.entity,
        this.hass.entities[this.entity.entity_id]
      ) ?? getDefaultFormatOptions(this.entity.state);

    return html`
      <mushroom-slider
        style="pointer-events: none;"
        .value=${!isNaN(value) ? value : undefined}
        .disabled=${!isAvailable(this.entity)}
        .inactive=${!isActive(this.entity)}
        .showActive=${true}
        .min=${this.config.min ?? this.entity.attributes.min ?? 0}
        .max=${this.config.max ?? this.entity.attributes.max ?? 100}
      />
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --slider-color: rgb(var(--rgb-state-number));
        --slider-outline-color: transparent;
        --slider-bg-color: rgba(var(--rgb-state-number), 0.2);
      }
      mushroom-slider {
        --main-color: var(--slider-color);
        --bg-color: var(--slider-bg-color);
        --main-outline-color: var(--slider-outline-color);
      }
    `;
  }
}
