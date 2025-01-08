import { css, CSSResultGroup, html, nothing, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  actionHandler,
  ActionHandlerEvent,
  computeRTL,
  handleAction,
  hasAction,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardEditor,
  LovelaceGridOptions,
  LovelaceLayoutOptions,
  RenderTemplateResult,
  subscribeRenderTemplate,
} from "../../ha";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { AREA_CARD_EDITOR_NAME, AREA_CARD_NAME } from "./const";
import { AreaCardConfig } from "./area-card-config";
import { LovelaceChipConfig } from "../../utils/lovelace/chip/types";
import { createChipElement } from "../../utils/lovelace/chip/chip-element";
import { MushroomBaseCard } from "../../utils/base-card";
import { EntityChip } from "./chips/entity-chip";

registerCustomCard({
  type: AREA_CARD_NAME,
  name: "Mushroom Area",
  description: "Build your own mushroom card using templates",
});

@customElement(AREA_CARD_NAME)
export class AreaCard
  extends MushroomBaseCard<AreaCardConfig>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./area-card-editor");
    return document.createElement(AREA_CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<AreaCardConfig> {
    const areas = Object.keys(hass.areas);
    const chips = await Promise.all([EntityChip.getStubConfig(hass)]);
    return {
      type: `custom:${AREA_CARD_NAME}`,
      icon: "mdi:texture-box",
      area: areas[0],
      chips,
    };
  }

  @property() public preview?: boolean;

  @property() public editMode?: boolean;

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  protected render() {
    if (!this._config || !this.hass || !this._config.area) {
      return nothing;
    }

    const area = this.hass.areas[this._config.area];

    if (!area) return nothing;

    const name = this._config.name || area.name;
    const icon = this._config.icon;
    const iconColor = this._config.icon_color;
    const appearance = computeAppearance(this._config);

    let layout = this._config.layout
      ? `layout-${this._config.layout}`
      : `layout-default`;
    console.log(this._config.layout);

    const picture = area.picture;

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
            ${icon ? this.renderStatelessIcon(icon, iconColor) : nothing}
            <mushroom-state-info
              slot="info"
              .primary=${name}
            ></mushroom-state-info>
          </mushroom-state-item>
          <div class="chip-container action ${layout}" ?rtl=${rtl}>
            ${this._config.chips.map((chip) => this.renderChip(chip))}
          </div>
        </mushroom-card>
      </ha-card>
    `;
  }

  private renderChip(chipConfig: LovelaceChipConfig) {
    const element = createChipElement(chipConfig);
    if (!element) {
      return nothing;
    }
    if (this.hass) {
      element.hass = this.hass;
    }
    element.editMode = this.editMode || this.preview;
    element.preview = this.preview || this.editMode;
    return html`${element}`;
  }

  @state() protected _config?: AreaCardConfig;

  @property({ reflect: true, type: String })
  public layout: string | undefined;

  renderPicture(picture: string): TemplateResult {
    return html`
      <mushroom-shape-avatar
        slot="icon"
        .picture_url=${(this.hass as any).hassUrl(picture)}
      ></mushroom-shape-avatar>
    `;
  }

  renderStatelessIcon(icon: string, iconColor?: string) {
    const iconStyle = {};
    if (iconColor) {
      const iconRgbColor = computeRgbColor(iconColor);
      iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
      iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
    }
    return html`
      <mushroom-shape-icon style=${styleMap(iconStyle)} slot="icon">
        <ha-state-icon .hass=${this.hass} .icon=${icon}></ha-state-icon>
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
        mushroom-shape-icon {
          --icon-color: rgb(var(--rgb-disabled));
          --shape-color: rgba(var(--rgb-disabled), 0.2);
        }
        svg {
          width: var(--icon-size);
          height: var(--icon-size);
          display: flex;
        }
        .chip-container {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: var(--chip-spacing);
        }
        .chip-container.layout-default {
          align-items: center;
          justify-content: flex-end;
          padding-right: 0.5rem;
        }
        .chip-container.layout-horizontal {
          align-items: center;
          justify-content: flex-end;
          padding-right: 0.5rem;
        }
        .chip-container.layout-vertical {
          justify-content: center;
          margin-top: -0.5rem;
          margin-bottom: 0.5rem;
        }
      `,
    ];
  }
}
