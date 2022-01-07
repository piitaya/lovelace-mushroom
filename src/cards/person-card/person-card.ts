import {
  ActionConfig,
  computeStateDisplay,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
  handleAction,
  ActionHandlerEvent,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/shape-icon";
import "../../shared/shape-avatar";
import "../../shared/badge-icon";
import { registerCustomCard } from "../../utils/custom-cards";
import { PERSON_CARD_EDITOR_NAME, PERSON_CARD_NAME } from "./const";
import "./person-card-editor";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

/*
 * TODO: make configurable icons, icons according to zone, show state indicator
 */
export interface PersonCardConfig extends LovelaceCardConfig {
  entity: string;
  icon?: string;
  use_entity_picture?: boolean;
  tap_action?: ActionConfig;
}

registerCustomCard({
  type: PERSON_CARD_NAME,
  name: "Mushroom Person Card",
  description: "Card for person entity",
});

@customElement(PERSON_CARD_NAME)
export class PersonCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement(
      PERSON_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<PersonCardConfig> {
    const entities = Object.keys(hass.states);
    const persons = entities.filter(
      (e) => e.substr(0, e.indexOf(".")) === "person"
    );
    return {
      type: `custom:${PERSON_CARD_NAME}`,
      entity: persons[0],
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: PersonCardConfig;

  getCardSize(): number | Promise<number> {
    return 1;
  }

  setConfig(config: PersonCardConfig): void {
    this._config = {
      tap_action: {
        action: "more-info",
      },
      ...config,
    };
  }

  get _isClickable(): boolean {
    return this._config?.tap_action?.action !== "none";
  }

  clickHandler(ev: ActionHandlerEvent): void {
    if (this._isClickable) {
      handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    const entity = this._config.entity;
    const entity_state = this.hass.states[entity];

    const name = this._config.name ?? entity_state.attributes.friendly_name;
    let icon = this._config.icon ?? "mdi:face-man";
    let picture: string | null = null;
    if (
      this._config.use_entity_picture &&
      entity_state.attributes.entity_picture
    ) {
      picture = entity_state.attributes.entity_picture;
    }

    const state = entity_state.state;
    let state_icon = "mdi:pine-tree";
    let state_color = "var(--state-not_home-color)";
    if (state === "unknown") {
      state_icon = "mdi:map-marker-alert";
      state_color = "var(--state-unknown-color)";
    } else if (state === "home") {
      state_icon = "mdi:home";
      state_color = "var(--state-home-color)";
    }

    const stateDisplay = computeStateDisplay(
      this.hass.localize,
      entity_state,
      this.hass.locale
    );

    return html`<ha-card
      @click=${this.clickHandler}
      class=${classMap({ clickable: this._isClickable })}
    >
      <div class="container">
        <div class="image-container">
          ${picture
            ? html`<mushroom-shape-avatar
                .picture_url=${picture}
              ></mushroom-shape-avatar>`
            : html`<mushroom-shape-icon .icon=${icon}></mushroom-shape-icon>`}
          <mushroom-badge-icon
            style=${styleMap({
              "--main-color": state_color,
            })}
            .icon=${state_icon}
          ></mushroom-badge-icon>
        </div>
        <div class="info-container">
          <span class="info-name">${name}</span>
          <span class="info-value">${stateDisplay}</span>
        </div>
      </div>
    </ha-card>`;
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        display: flex;
        flex-direction: column;
        padding: 12px;
      }
      ha-card.clickable {
        cursor: pointer;
      }
      .container {
        display: flex;
        flex-direction: row;
        position: relative;
      }
      .container > *:not(:last-child) {
        margin-right: 12px;
      }
      .image-container {
        position: relative;
      }
      mushroom-badge-icon {
        position: absolute;
        top: -3px;
        right: -3px;
      }
      .info-container {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .info-name {
        font-weight: bold;
        font-size: 14px;
        color: var(--primary-text-color);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .info-value {
        font-weight: bolder;
        font-size: 12px;
        color: var(--secondary-text-color);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    `;
  }
}
