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
import "../../shared/state-item";
import { registerCustomCard } from "../../utils/custom-cards";
import { SWITCH_CARD_EDITOR_NAME, SWITCH_CARD_NAME } from "./const";
import "./switch-card-editor";

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
        --color-active: #3D5AFE;
      }
    `;
  }
}
