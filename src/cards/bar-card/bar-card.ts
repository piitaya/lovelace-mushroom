import { HassEntity } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  nothing,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, state, property } from "lit/decorators.js";
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
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import {
  BAR_CARD_EDITOR_NAME,
  BAR_CARD_NAME,
  BAR_ENTITY_DOMAINS,
  BAR_SEVERITY_COLORS,
} from "./const";
import "./controls/bar-value-control";
import { BarCardConfig, ColorSeverityDirection } from "./bar-card-config";



registerCustomCard({
  type: BAR_CARD_NAME,
  name: "Mushroom Bar Card",
  description: "Card for sensor entity (mostly)",
});

@customElement(BAR_CARD_NAME)
export class BarCard
  extends MushroomBaseCard<BarCardConfig>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./bar-card-editor");
    return document.createElement(
      BAR_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<BarCardConfig> {
    const entities = Object.keys(hass.states);
    const numbers = entities.filter((e) =>
      BAR_ENTITY_DOMAINS.includes(e.split(".")[0])
    );
    return {
      type: `custom:${BAR_CARD_NAME}`,
      entity: numbers[0],
    };
  }

  protected get hasControls(): boolean {
    return true;
  }

  @state() private value?: number;

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (this.hass && changedProperties.has("hass")) {
      this.updateValue();
    }
  }

  updateValue() {
    this.value = undefined;
    const stateObj = this._stateObj;

    if (!stateObj || Number.isNaN(stateObj.state)) return;
    this.value = Number(stateObj.state);
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
    if (this.value !== undefined) {
      stateDisplay = this.hass.formatEntityState(
        stateObj,
        this.value.toString()
      );
    }

    const rtl = computeRTL(this.hass);

    const sliderStyle = {};
    const iconColor = this._config?.icon_color;
    if (iconColor) {
      const iconRgbColor = computeRgbColor(iconColor);
      sliderStyle["--slider-color"] = `rgb(${iconRgbColor})`;
      sliderStyle["--slider-bg-color"] = `rgba(${iconRgbColor}, 0.2)`;
    }
    if (this._config?.enable_color_severity) {
      const sliderColor = this.computeSliderRgbColor(stateObj)
      sliderStyle["--slider-color"] = `rgb(${sliderColor})`;
      sliderStyle["--slider-bg-color"] = `rgba(${sliderColor}, 0.2)`;
    }
    const actionHandlerDirective = actionHandler({
      hasHold: hasAction(this._config.hold_action),
      hasDoubleClick: hasAction(this._config.double_tap_action),
    });
  
    return html`
      <ha-card
        class=${classMap({ "fill-container": appearance.fill_container })}
      >
        <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
          <mushroom-state-item
            ?rtl=${rtl}
            .appearance=${appearance}
            @action=${this._handleAction}
            .actionHandler=${actionHandlerDirective}
          >
            ${picture
              ? this.renderPicture(picture)
              : this.renderIcon(stateObj, icon)}
            ${this.renderBadge(stateObj)}
            ${this.renderStateInfo(stateObj, appearance, name, stateDisplay)};
          </mushroom-state-item>
          <div class="actions" 
            ?rtl=${rtl}             
            @action=${this._handleAction}
            .actionHandler=${actionHandlerDirective}
          >
            <mushroom-bar-value-control
              .hass=${this.hass}
              .entity=${stateObj}
              .config=${this._config}
              style=${styleMap(sliderStyle)}
            ></mushroom-bar-value-control>
          </div>
        </mushroom-card>
      </ha-card>
    `;
  }

  renderIcon(stateObj: HassEntity, icon?: string): TemplateResult {
    const active = isActive(stateObj);
    const iconStyle = {};
    const iconColor = this._config?.icon_color;
    if (iconColor) {
      const iconRgbColor = computeRgbColor(iconColor);
      iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
      iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
    }
    return html`
      <mushroom-shape-icon
        slot="icon"
        .disabled=${!active}
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

  getSeverityColorForValue(
    current: number, 
    min: number, 
    max: number, 
    direction: ColorSeverityDirection = "forward"
  ): string {
    const range = max - min;
    if (range === 0) return BAR_SEVERITY_COLORS[7];

    const current_percent = Math.max(0, Math.min(100, ((current - min) / range) * 100));
    let current_color_index = Math.min(7, Math.floor(current_percent / 12.5))
    if (direction === "reverse") {
      current_color_index = 7 - current_color_index
    }
    return BAR_SEVERITY_COLORS[current_color_index];
  }

  computeSliderRgbColor(entity: HassEntity): string {
    const min_value = Number(this._config?.min ?? entity.attributes.min ?? 0)
    const max_value = Number(this._config?.max ?? entity.attributes.max ?? 100)
    const bar_color_name = this.getSeverityColorForValue(
      Number(entity.state), 
      min_value, 
      max_value, 
      this._config?.severity_direction,
    )
    return computeRgbColor(bar_color_name)
  }


  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cardStyle,
      css`
        mushroom-state-item {
          cursor: pointer;
        }
        mushroom-bar-value-control {
          cursor: pointer;
        }
        mushroom-shape-icon {
          --icon-color: rgb(var(--rgb-state-number));
          --shape-color: rgba(var(--rgb-state-number), 0.2);
        }
        mushroom-bar-value-control {
          flex: 1;
        }
      `,
    ];
  }
}
