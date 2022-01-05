import {
  computeStateDisplay,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
  stateIcon,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { registerCustomCard } from "../../utils/custom-cards";
import { LIGHT_CARD_EDITOR_NAME, LIGHT_CARD_NAME } from "./const";
import "../../shared/state-item";
import "./light-card-editor";

export interface LightCardConfig extends LovelaceCardConfig {
  entity: string;
  icon?: string;
  name?: string;
}

registerCustomCard({
  type: LIGHT_CARD_NAME,
  name: "Mushroom Light Card",
  description: "Card for light entity",
});

@customElement(LIGHT_CARD_NAME)
export class LightCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement(LIGHT_CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<LightCardConfig> {
    const entities = Object.keys(hass.states);
    const lights = entities.filter(
      (e) => e.substr(0, e.indexOf(".")) === "light"
    );
    return {
      type: `custom:${LIGHT_CARD_NAME}`,
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

    const name = this._config.name ?? entity_state.attributes.friendly_name;
    const icon = this._config.icon ?? stateIcon(entity_state);

    const state = entity_state.state;

    const stateDisplay = computeStateDisplay(
      this.hass.localize,
      entity_state,
      this.hass.locale
    );

    const brightness =
      entity_state.attributes.brightness != null
        ? Math.round((entity_state.attributes.brightness * 100) / 255)
        : undefined;

    return html`<ha-card @click=${this.clickHandler}>
      <mui-state-item
        .icon=${icon}
        .name=${name}
        .value=${brightness != null ? `${brightness}%` : stateDisplay}
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
