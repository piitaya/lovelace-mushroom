import { HassEntity } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  actionHandler,
  ActionHandlerEvent,
  computeRTL,
  getEntityPicture,
  handleAction,
  hasAction,
  HomeAssistant,
  isActive,
} from "../../../ha";
import { computeRgbColor } from "../../../utils/colors";
import { computeInfoDisplay } from "../../../utils/info";
import {
  computeChipComponentName,
  computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import {
  EntityChipConfig,
  LovelaceChip,
} from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

@customElement(computeChipComponentName("entity"))
export class EntityChip extends LitElement implements LovelaceChip {
  public static async getConfigElement(): Promise<LovelaceChipEditor> {
    await import("./entity-chip-editor");
    return document.createElement(
      computeChipEditorComponentName("entity")
    ) as LovelaceChipEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<EntityChipConfig> {
    const entities = Object.keys(hass.states);
    return {
      type: `entity`,
      entity: entities[0],
    };
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EntityChipConfig;

  public setConfig(config: EntityChipConfig): void {
    this._config = config;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  protected render() {
    if (!this.hass || !this._config || !this._config.entity) {
      return nothing;
    }

    const entityId = this._config.entity;
    const stateObj = this.hass.states[entityId] as HassEntity | undefined;

    if (!stateObj) {
      return nothing;
    }

    const name = this._config.name || stateObj.attributes.friendly_name || "";
    const icon = this._config.icon;
    const iconColor = this._config.icon_color;

    const picture = this._config.use_entity_picture
      ? getEntityPicture(stateObj)
      : undefined;

    const stateDisplay = this.hass.formatEntityState(stateObj);

    const active = isActive(stateObj);

    const content = computeInfoDisplay(
      this._config.content_info ?? "state",
      name,
      stateDisplay,
      stateObj,
      this.hass
    );

    const rtl = computeRTL(this.hass);

    return html`
      <mushroom-chip
        ?rtl=${rtl}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config.hold_action),
          hasDoubleClick: hasAction(this._config.double_tap_action),
        })}
        .avatar=${picture ? (this.hass as any).hassUrl(picture) : undefined}
        .avatarOnly=${picture && !content}
      >
        ${!picture
          ? this.renderIcon(stateObj, icon, iconColor, active)
          : nothing}
        ${content ? html`<span>${content}</span>` : nothing}
      </mushroom-chip>
    `;
  }

  renderIcon(
    stateObj: HassEntity,
    icon: string | undefined,
    iconColor: string | undefined,
    active: boolean
  ): TemplateResult {
    const iconStyle = {};
    if (iconColor) {
      const iconRgbColor = computeRgbColor(iconColor);
      iconStyle["--color"] = `rgb(${iconRgbColor})`;
    }
    return html`
      <ha-state-icon
        .hass=${this.hass}
        .stateObj=${stateObj}
        .icon=${icon}
        style=${styleMap(iconStyle)}
        class=${classMap({ active })}
      ></ha-state-icon>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      mushroom-chip {
        cursor: pointer;
      }
      ha-state-icon.active {
        color: var(--color);
      }
    `;
  }
}
