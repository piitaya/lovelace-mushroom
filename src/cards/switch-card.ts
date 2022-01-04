import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
} from "custom-card-helpers";
import "../shared/state-item";

export interface LightCardConfig extends LovelaceCardConfig {
  entity: string;
  icon?: string;
  name?: string;
}

@customElement("mui-switch-card")
export class SwitchCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: LightCardConfig;

  getCardSize(): number | Promise<number> {
    return 1;
  }

  setConfig(config: LightCardConfig): void {
    this._config = config;
  }

  clickHandler(): void {
    this.hass.callService("switch", "toggle", {
      entity_id: this._config?.entity,
    });
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    const entity = this._config.entity;
    const entity_state = this.hass.states[entity];

    const icon =
      this._config.icon ?? entity_state.attributes.icon ?? "mdi:power-plug";
    const name = this._config.name ?? entity_state.attributes.friendly_name;
    const state = entity_state.state;

    return html`<ha-card @click=${this.clickHandler}>
      <mui-state-item
        .icon=${icon}
        .name=${name}
        .value=${state}
        .active=${state === "on"}
      ></mui-state-item>
    </ha-card>`;
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        cursor: pointer;
      }
      mui-state-item {
        --color-active: 0, 0, 255;
      }
    `;
  }
}
