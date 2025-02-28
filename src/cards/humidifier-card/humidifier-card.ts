import { css, CSSResultGroup, html, nothing } from "lit";
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
  HumidifierEntity,
  isActive,
  isAvailable,
  LovelaceCard,
  LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
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
  HUMIDIFIER_CARD_EDITOR_NAME,
  HUMIDIFIER_CARD_NAME,
  HUMIDIFIER_ENTITY_DOMAINS,
} from "./const";
import "./controls/humidifier-humidity-control";
import { HumidifierCardConfig } from "./humidifier-card-config";

registerCustomCard({
  type: HUMIDIFIER_CARD_NAME,
  name: "Mushroom Humidifier Card",
  description: "Card for humidifier entity",
});

@customElement(HUMIDIFIER_CARD_NAME)
export class HumidifierCard
  extends MushroomBaseCard<HumidifierCardConfig, HumidifierEntity>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./humidifier-card-editor");
    return document.createElement(
      HUMIDIFIER_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<HumidifierCardConfig> {
    const entities = Object.keys(hass.states);
    const humidifiers = entities.filter((e) =>
      HUMIDIFIER_ENTITY_DOMAINS.includes(e.split(".")[0])
    );
    return {
      type: `custom:${HUMIDIFIER_CARD_NAME}`,
      entity: humidifiers[0],
    };
  }

  protected get hasControls(): boolean {
    return Boolean(this._config?.show_target_humidity_control);
  }

  setConfig(config: HumidifierCardConfig): void {
    super.setConfig({
      tap_action: {
        action: "toggle",
      },
      hold_action: {
        action: "more-info",
      },
      ...config,
    });
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

    let stateDisplay = this.hass.formatEntityState(stateObj);
    if (stateObj.attributes.current_humidity !== null) {
      const humidity = this.hass.formatEntityAttributeValue(
        stateObj,
        "current_humidity"
      );
      stateDisplay += ` ⸱ ${humidity}`;
    }

    const rtl = computeRTL(this.hass);

    const displayControls =
      (!this._config.collapsible_controls || isActive(stateObj)) &&
      this._config.show_target_humidity_control;

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
            ${this.renderStateInfo(stateObj, appearance, name, stateDisplay)};
          </mushroom-state-item>
          ${displayControls
            ? html`
                <div class="actions" ?rtl=${rtl}>
                  <mushroom-humidifier-humidity-control
                    .hass=${this.hass}
                    .entity=${stateObj}
                  ></mushroom-humidifier-humidity-control>
                </div>
              `
            : nothing}
        </mushroom-card>
      </ha-card>
    `;
  }

  protected renderBadge(entity: HumidifierEntity) {
    if (isAvailable(entity)) {
      return this.renderActionBadge(entity);
    } else {
      return super.renderBadge(entity);
    }
  }

  renderActionBadge(entity: HumidifierEntity) {
    const action = entity.attributes.action;
    if (!action || action == "off") return nothing;

    const color =
      action === "idle" ? "var(--rgb-disabled)" : "var(--rgb-state-humidifier)";
    const icon = action === "idle" ? "mdi:clock-outline" : "mdi:water-percent";

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

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cardStyle,
      css`
        mushroom-state-item {
          cursor: pointer;
        }
        mushroom-shape-icon {
          --icon-color: rgb(var(--rgb-state-humidifier));
          --shape-color: rgba(var(--rgb-state-humidifier), 0.2);
        }
        mushroom-humidifier-humidity-control {
          flex: 1;
        }
      `,
    ];
  }
}
