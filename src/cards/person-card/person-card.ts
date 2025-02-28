import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  actionHandler,
  ActionHandlerEvent,
  computeRTL,
  handleAction,
  hasAction,
  HomeAssistant,
  isAvailable,
  LovelaceCard,
  LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import {
  PERSON_CARD_EDITOR_NAME,
  PERSON_CARD_NAME,
  PERSON_ENTITY_DOMAINS,
} from "./const";
import { PersonCardConfig } from "./person-card-config";
import { getStateColor, getStateIcon } from "./utils";

registerCustomCard({
  type: PERSON_CARD_NAME,
  name: "Mushroom Person Card",
  description: "Card for person entity",
});

@customElement(PERSON_CARD_NAME)
export class PersonCard
  extends MushroomBaseCard<PersonCardConfig>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./person-card-editor");
    return document.createElement(
      PERSON_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<PersonCardConfig> {
    const entities = Object.keys(hass.states);
    const people = entities.filter((e) =>
      PERSON_ENTITY_DOMAINS.includes(e.split(".")[0])
    );
    return {
      type: `custom:${PERSON_CARD_NAME}`,
      entity: people[0],
    };
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  protected render() {
    if (!this._config || !this.hass || !this._config.entity) {
      return nothing;
    }

    const stateObj = this._stateObj;

    if (!stateObj) {
      return this.renderNotFound(this._config);
    }

    const name = this._config.name || stateObj.attributes.friendly_name || "";
    const icon = this._config.icon;
    const appearance = computeAppearance(this._config);
    const picture = computeEntityPicture(stateObj, appearance.icon_type);

    const rtl = computeRTL(this.hass);

    return html`
      <ha-card
        class=${classMap({ "fill-container": appearance.fill_container })}
      >
        <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
          <mushroom-state-item
            ?rtl=${rtl}
            .appearance=${appearance}
            @action=${this._handleAction}
            .actionHandler=${actionHandler({
              hasHold: hasAction(this._config.hold_action),
              hasDoubleClick: hasAction(this._config.double_tap_action),
            })}
          >
            ${picture
              ? this.renderPicture(picture)
              : this.renderIcon(stateObj, icon)}
            ${this.renderBadge(stateObj)}
            ${this.renderStateInfo(stateObj, appearance, name)};
          </mushroom-state-item>
        </mushroom-card>
      </ha-card>
    `;
  }

  renderStateBadge(stateObj: HassEntity) {
    const zones = Object.values(this.hass.states).filter((stateObj) =>
      stateObj.entity_id.startsWith("zone.")
    );
    const icon = getStateIcon(stateObj, zones);
    const color = getStateColor(stateObj, zones);

    return html`
      <mushroom-badge-icon
        slot="badge"
        .icon=${icon}
        style=${styleMap({
          "--main-color": `rgb(${color})`,
        })}
      ></mushroom-badge-icon>
    `;
  }

  renderBadge(stateObj: HassEntity) {
    const unavailable = !isAvailable(stateObj);
    if (unavailable) {
      return super.renderBadge(stateObj);
    } else {
      return this.renderStateBadge(stateObj);
    }
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cardStyle,
      css`
        mushroom-state-item {
          cursor: pointer;
        }
      `,
    ];
  }
}
