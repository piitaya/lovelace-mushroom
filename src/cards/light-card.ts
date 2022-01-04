import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
} from "custom-card-helpers";

export interface LightCardConfig extends LovelaceCardConfig {
  entity: string;
  icon?: string;
  name?: string;
}

@customElement("mui-light-card")
export class LightCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: LightCardConfig;

  getCardSize(): number | Promise<number> {
    return 2;
  }

  setConfig(config: LightCardConfig): void {
    this._config = config;
  }

  clickHandler(): void {
    this.hass.callService("light", "toggle", {
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
      this._config.icon ?? entity_state.attributes.icon ?? "mdi:lightbulb";
    const name = this._config.name ?? entity_state.attributes.friendly_name;
    const state = entity_state.state;

    const brightness =
      entity_state.attributes.brightness != null
        ? Math.round((entity_state.attributes.brightness * 100) / 255)
        : undefined;

    return html`<ha-card @click=${this.clickHandler}>
      <div class=${classMap({ container: true, active: state === "on" })}>
        <div class="icon-container">
          <div class="icon-circle">
            <ha-icon class="icon" .icon=${icon} />
          </div>
        </div>
        <div class="info-container">
          <span class="info-name">${name}</span>
          <span class="info-value"
            >${brightness ? `${brightness}%` : state}</span
          >
        </div>
      </div>
    </ha-card>`;
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        --color-theme: 51, 51, 51;
        --color-yellow: 255, 145, 1;
        --color-text: 33, 33, 33;
        cursor: pointer;
      }
      .container {
        display: flex;
        flex-direction: row;
        padding: 12px;
      }
      .container > *:not(:last-child) {
        margin-right: 12px;
      }
      .icon-container {
        width: 42px;
        height: 42px;
        flex: none;
      }
      .icon-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(var(--color-theme), 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 280ms ease-in-out;
      }
      .active .icon-circle {
        background-color: rgba(var(--color-yellow), 0.2);
      }
      .icon {
        color: rgba(var(--color-theme), 0.2);
        --mdc-icon-size: 20px;
        transition: color 280ms ease-in-out;
      }
      .active .icon {
        color: rgba(var(--color-yellow), 1);
      }
      .info-container {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .info-name {
        font-weight: bold;
        font-size: 14px;
        color: rgba(var(--color-text), 1);
      }
      .info-value {
        font-weight: bolder;
        font-size: 12px;
        color: rgba(var(--color-text), 0.4);
      }
    `;
  }
}
