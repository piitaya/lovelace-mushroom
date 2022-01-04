import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
} from "custom-card-helpers";
import "../../shared/state-item";
import "./light-card-editor";
import { registerCard } from "../../shared/editor-utils";

export interface LightCardConfig extends LovelaceCardConfig {
  entity: string;
  icon?: string;
  name?: string;
}

registerCard({
  type: "mui-light-card",
  name: "Minimalist Light Card",
  description: "Card for light entity",
});

@customElement("mui-light-card")
export class LightCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement(
      "mui-light-card-editor"
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<LightCardConfig> {
    const entities = Object.keys(hass.states);
    const lights = entities.filter(
      (e) => e.substr(0, e.indexOf(".")) === "light"
    );
    return {
      type: "custom:mui-light-card",
      entity: lights[0],
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: LightCardConfig;

  getCardSize(): number | Promise<number> {
    return 1;
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
      <mui-state-item
        .icon=${icon}
        .name=${name}
        .value=${brightness ? `${brightness}%` : state}
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
        --color-active: 255, 145, 1;
      }
    `;
  }
}
