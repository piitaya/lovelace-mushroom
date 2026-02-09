import {
  css,
  CSSResultGroup,
  html,
  nothing,
  PropertyValues,
  TemplateResult,
} from "lit";
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
import "./controls/humidifier-modes-control";
import { HumidifierCardConfig } from "./humidifier-card-config";

type HumidifierCardControl = "humidity_control" | "mode_control";

const CONTROLS_ICONS: Record<HumidifierCardControl, string> = {
  humidity_control: "mdi:water-percent",
  mode_control: "mdi:water",
};

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
  connectedCallback() {
    super.connectedCallback();
  }

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

  @state() private _activeControl?: HumidifierCardControl;

  private get _controls(): HumidifierCardControl[] {
    if (!this._config || !this._stateObj) {
      return [];
    }

    const stateObj = this._stateObj;
    const controls: HumidifierCardControl[] = [];

    if (this._config.show_target_humidity_control) {
      controls.push("humidity_control");
    }
    if (
      this._config.show_mode_control &&
      this._config.available_modes?.length
    ) {
      controls.push("mode_control");
    }

    return controls;
  }

  protected get hasControls(): boolean {
    return this._controls.length > 0;
  }

  _onControlTap(ctrl, e): void {
    e.stopPropagation();
    this._activeControl = ctrl;
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
    this.updateActiveControl();
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (this.hass && changedProperties.has("hass")) {
      this.updateActiveControl();
    }
  }

  updateActiveControl() {
    const isActiveControlSupported = this._activeControl
      ? this._controls.includes(this._activeControl)
      : false;
    this._activeControl = isActiveControlSupported
      ? this._activeControl
      : this._controls[0];
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

    const { current_humidity, humidity } = stateObj.attributes;
    if (!!current_humidity || !!humidity) {
      console.log("current_humidity", stateObj.attributes.current_humidity);
      const humidity = this.hass.formatEntityAttributeValue(
        stateObj,
        current_humidity ? "current_humidity" : "humidity"
      );
      stateDisplay += ` ⸱ ${humidity}`;
    }

    const rtl = computeRTL(this.hass);

    const displayControls =
      (!this._config.collapsible_controls || isActive(stateObj)) &&
      this._controls.length;

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
                  ${this.renderActiveControl(stateObj)}
                  ${this.renderOtherControls()}
                </div>
              `
            : nothing}
        </mushroom-card>
      </ha-card>
    `;
  }

  private renderOtherControls(): TemplateResult | null {
    if (this._controls.length <= 1) return null;

    return html`
      <div class="other-controls">
        ${this._controls.map((control) =>
          control !== this._activeControl
            ? html`
                <mushroom-button
                  @click=${(e) => this._onControlTap(control, e)}
                >
                  <ha-icon .icon=${CONTROLS_ICONS[control]}></ha-icon>
                </mushroom-button>
              `
            : nothing
        )}
      </div>
    `;
  }

  private renderActiveControl(entity: HumidifierEntity): TemplateResult | null {
    if (!this._activeControl || !this._config) return null;

    switch (this._activeControl) {
      case "humidity_control":
        return html`
          <mushroom-humidifier-humidity-control
            .hass=${this.hass}
            .entity=${entity}
          ></mushroom-humidifier-humidity-control>
        `;
      case "mode_control":
        return html`
          <mushroom-humidifier-modes-control
            .hass=${this.hass}
            .entity=${entity}
            .modes=${this._config.available_modes}
          ></mushroom-humidifier-modes-control>
        `;
      default:
        return null;
    }
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
        mushroom-humidifier-humidity-control,
        mushroom-humidifier-modes-control {
          flex: 1;
        }
        .other-controls {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          gap: 8px;
        }
      `,
    ];
  }
}
