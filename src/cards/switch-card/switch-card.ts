import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
} from "custom-card-helpers";
import "../../shared/state-item";
import "./switch-card-editor";
import { registerCustomCard } from "../../utils/custom-cards";
import { SWITCH_CARD_EDITOR_NAME, SWITCH_CARD_NAME } from "./const";

export interface SwitchCardConfig extends LovelaceCardConfig {
  entity: string;
  icon?: string;
  name?: string;
}

registerCustomCard({
  type: SWITCH_CARD_NAME,
  name: "Mushroom Switch Card",
  description: "Card for switch entity",
});

@customElement(SWITCH_CARD_NAME)
export class SwitchCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement(
      SWITCH_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<SwitchCardConfig> {
    const entities = Object.keys(hass.states);
    const lights = entities.filter(
      (e) => e.substr(0, e.indexOf(".")) === "switch"
    );
    return {
      type: `custom:${SWITCH_CARD_NAME}`,
      entity: lights[0],
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: SwitchCardConfig;

  getCardSize(): number | Promise<number> {
    return 1;
  }

  setConfig(config: SwitchCardConfig): void {
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
