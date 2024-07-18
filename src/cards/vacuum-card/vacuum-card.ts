import { HassEntity } from "home-assistant-js-websocket";
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
  isActive,
  LovelaceCard,
  LovelaceCardEditor,
  VacuumEntity,
} from "../../ha";
import "../../shared/badge-icon";
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
  VACUUM_CARD_EDITOR_NAME,
  VACUUM_CARD_NAME,
  VACUUM_ENTITY_DOMAINS,
} from "./const";
import "./controls/vacuum-commands-control";
import {
  isCommandsControlSupported,
  isCommandsControlVisible,
} from "./controls/vacuum-commands-control";
import { isCleaning, isReturningHome } from "./utils";
import { VacuumCardConfig } from "./vacuum-card-config";

registerCustomCard({
  type: VACUUM_CARD_NAME,
  name: "Mushroom Vacuum Card",
  description: "Card for vacuum entity",
});

@customElement(VACUUM_CARD_NAME)
export class VacuumCard
  extends MushroomBaseCard<VacuumCardConfig, VacuumEntity>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./vacuum-card-editor");
    return document.createElement(
      VACUUM_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<VacuumCardConfig> {
    const entities = Object.keys(hass.states);
    const vacuums = entities.filter((e) =>
      VACUUM_ENTITY_DOMAINS.includes(e.split(".")[0])
    );
    return {
      type: `custom:${VACUUM_CARD_NAME}`,
      entity: vacuums[0],
    };
  }

  protected get hasControls() {
    if (!this._stateObj || !this._config) return false;
    return isCommandsControlSupported(
      this._stateObj,
      this._config.commands ?? []
    );
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

    const commands = this._config?.commands ?? [];

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
          ${isCommandsControlVisible(stateObj, commands)
            ? html`
                <div class="actions" ?rtl=${rtl}>
                  <mushroom-vacuum-commands-control
                    .hass=${this.hass}
                    .entity=${stateObj}
                    .commands=${commands}
                    .fill=${appearance.layout !== "horizontal"}
                  >
                  </mushroom-vacuum-commands-control>
                </div>
              `
            : nothing}
        </mushroom-card>
      </ha-card>
    `;
  }

  protected renderIcon(stateObj: HassEntity, icon?: string): TemplateResult {
    return html`
      <mushroom-shape-icon
        slot="icon"
        class=${classMap({
          returning:
            isReturningHome(stateObj) && Boolean(this._config?.icon_animation),
          cleaning:
            isCleaning(stateObj) && Boolean(this._config?.icon_animation),
        })}
        style=${styleMap({})}
        .disabled=${!isActive(stateObj)}
      >
        <ha-state-icon
          .hass=${this.hass}
          .stateObj=${stateObj}
          .icon=${icon}
        ></ha-state-icon
      ></mushroom-shape-icon>
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
          --icon-color: rgb(var(--rgb-state-vacuum));
          --shape-color: rgba(var(--rgb-state-vacuum), 0.2);
        }
        .cleaning ha-state-icon {
          animation: 5s infinite linear cleaning;
        }
        .cleaning ha-state-icon {
          animation: 2s infinite linear returning;
        }
        mushroom-vacuum-commands-control {
          flex: 1;
        }
      `,
    ];
  }
}
