import { css, CSSResultGroup, html, nothing, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
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
  LockEntity,
  LovelaceCard,
  LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import {
  LOCK_CARD_EDITOR_NAME,
  LOCK_CARD_NAME,
  LOCK_ENTITY_DOMAINS,
} from "./const";
import "./controls/lock-buttons-control";
import { LockCardConfig } from "./lock-card-config";
import { isActionPending, isLocked, isUnlocked } from "./utils";

registerCustomCard({
  type: LOCK_CARD_NAME,
  name: "Mushroom Lock Card",
  description: "Card for all lock entities",
});

@customElement(LOCK_CARD_NAME)
export class LockCard
  extends MushroomBaseCard<LockCardConfig, LockEntity>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./lock-card-editor");
    return document.createElement(LOCK_CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<LockCardConfig> {
    const entities = Object.keys(hass.states);
    const locks = entities.filter((e) =>
      LOCK_ENTITY_DOMAINS.includes(e.split(".")[0])
    );
    return {
      type: `custom:${LOCK_CARD_NAME}`,
      entity: locks[0],
    };
  }

  protected get hasControls(): boolean {
    return true;
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
              : this.renderIcon(stateObj as LockEntity, icon)}
            ${this.renderBadge(stateObj)}
            ${this.renderStateInfo(stateObj, appearance, name)};
          </mushroom-state-item>
          <div class="actions" ?rtl=${rtl}>
            <mushroom-lock-buttons-control
              .hass=${this.hass}
              .entity=${stateObj}
              .fill=${appearance.layout !== "horizontal"}
            >
            </mushroom-lock-buttons-control>
          </div>
        </mushroom-card>
      </ha-card>
    `;
  }

  renderIcon(stateObj: LockEntity, icon?: string): TemplateResult {
    const available = isAvailable(stateObj);

    const iconStyle = {
      "--icon-color": "rgb(var(--rgb-state-lock))",
      "--shape-color": "rgba(var(--rgb-state-lock), 0.2)",
    };

    if (isLocked(stateObj)) {
      iconStyle["--icon-color"] = `rgb(var(--rgb-state-lock-locked))`;
      iconStyle["--shape-color"] = `rgba(var(--rgb-state-lock-locked), 0.2)`;
    } else if (isUnlocked(stateObj)) {
      iconStyle["--icon-color"] = `rgb(var(--rgb-state-lock-unlocked))`;
      iconStyle["--shape-color"] = `rgba(var(--rgb-state-lock-unlocked), 0.2)`;
    } else if (isActionPending(stateObj)) {
      iconStyle["--icon-color"] = `rgb(var(--rgb-state-lock-pending))`;
      iconStyle["--shape-color"] = `rgba(var(--rgb-state-lock-pending), 0.2)`;
    }

    return html`
      <mushroom-shape-icon
        slot="icon"
        .disabled=${!available}
        style=${styleMap(iconStyle)}
      >
        <ha-state-icon
          .hass=${this.hass}
          .stateObj=${stateObj}
          .icon=${icon}
        ></ha-state-icon>
      </mushroom-shape-icon>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cardStyle,
      css`
        mushroom-state-item {
          cursor: pointer;
        }
        mushroom-lock-buttons-control {
          flex: 1;
        }
      `,
    ];
  }
}
