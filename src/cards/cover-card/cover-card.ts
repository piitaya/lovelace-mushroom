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
import { COVER_CARD_EDITOR_NAME, COVER_CARD_NAME } from "./const";
import "../../shared/state-item";
import "./cover-card-editor";

export interface CoverCardConfig extends LovelaceCardConfig {
  entity: string;
  icon?: string;
  name?: string;
}

registerCustomCard({
  type: COVER_CARD_NAME,
  name: "Mushroom Cover Card",
  description: "Card for cover entity",
});

@customElement(COVER_CARD_NAME)
export class CoverCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement(COVER_CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<CoverCardConfig> {
    const entities = Object.keys(hass.states);
    const covers = entities.filter(
      (e) => e.substr(0, e.indexOf(".")) === "cover"
    );
    return {
      type: `custom:${COVER_CARD_NAME}`,
      entity: covers[0],
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: CoverCardConfig;

  getCardSize(): number | Promise<number> {
    return 1;
  }

  setConfig(config: CoverCardConfig): void {
    this._config = config;
  }

  clickHandler(): void {}

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

    return html`<ha-card @click=${this.clickHandler}>
      <mui-state-item
        .icon=${icon}
        .name=${name}
        .value=${stateDisplay}
        .active=${state === "open" || state === "opening"}
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
