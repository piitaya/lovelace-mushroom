import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  computeRTL,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
} from "../../ha";
import "../../shared/chip";
import { computeDarkMode, MushroomBaseElement } from "../../utils/base-element";
import { registerCustomCard } from "../../utils/custom-cards";
import { createChipElement } from "../../utils/lovelace/chip/chip-element";
import {
  LovelaceChip,
  LovelaceChipConfig,
} from "../../utils/lovelace/chip/types";
import "./chips";
import { setupConditionChipComponent } from "./chips/conditional-chip";
import { EntityChip } from "./chips/entity-chip";
import { CHIPS_CARD_EDITOR_NAME, CHIPS_CARD_NAME } from "./const";

export interface ChipsCardConfig extends LovelaceCardConfig {
  chips: LovelaceChipConfig[];
  alignment?: string;
}

registerCustomCard({
  type: CHIPS_CARD_NAME,
  name: "Mushroom Chips Card",
  description: "Card with chips to display informations",
});

@customElement(CHIPS_CARD_NAME)
export class ChipsCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./chips-card-editor");
    return document.createElement(CHIPS_CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    _hass: HomeAssistant
  ): Promise<ChipsCardConfig> {
    const chips = await Promise.all([EntityChip.getStubConfig(_hass)]);
    return {
      type: `custom:${CHIPS_CARD_NAME}`,
      chips,
    };
  }

  @property() public preview?: boolean;

  @property() public editMode?: boolean;

  @state() private _config?: ChipsCardConfig;

  private _hass?: HomeAssistant;

  set hass(hass: HomeAssistant) {
    const currentDarkMode = computeDarkMode(this._hass);
    const newDarkMode = computeDarkMode(hass);
    if (currentDarkMode !== newDarkMode) {
      this.toggleAttribute("dark-mode", newDarkMode);
    }
    this._hass = hass;
    this.shadowRoot?.querySelectorAll("div > *").forEach((element: unknown) => {
      (element as LovelaceChip).hass = hass;
    });
  }

  getCardSize(): number | Promise<number> {
    return 1;
  }

  setConfig(config: ChipsCardConfig): void {
    this._config = config;
  }

  protected render() {
    if (!this._config || !this._hass) {
      return nothing;
    }

    let alignment = "";
    if (this._config.alignment) {
      alignment = `align-${this._config.alignment}`;
    }

    const rtl = computeRTL(this._hass);
    const chips = this._config.chips;

    // justify 模式：分成三部分渲染（左边 | 中间容器 | 右边）
    if (this._config.alignment === "justify" && chips.length >= 2) {
      const firstChip = chips[0];
      const lastChip = chips[chips.length - 1];
      const middleChips = chips.slice(1, -1);

      return html`
        <ha-card>
          <div class="chip-container ${alignment}" ?rtl=${rtl}>
            <div class="left-section">${this.renderChip(firstChip)}</div>
            <div class="center-wrapper">
              ${middleChips.map((chip) => this.renderChip(chip))}
            </div>
            <div class="right-section">${this.renderChip(lastChip)}</div>
          </div>
        </ha-card>
      `;
    }

    // 其他对齐模式：正常渲染
    return html`
      <ha-card>
        <div class="chip-container ${alignment}" ?rtl=${rtl}>
          ${chips.map((chip) => this.renderChip(chip))}
        </div>
      </ha-card>
    `;
  }

  private renderChip(chipConfig: LovelaceChipConfig) {
    if (chipConfig.type === "conditional") {
      setupConditionChipComponent();
    }
    const element = createChipElement(chipConfig);
    if (!element) {
      return nothing;
    }
    if (this._hass) {
      element.hass = this._hass;
    }
    element.editMode = this.editMode || this.preview;
    element.preview = this.preview || this.editMode;
    return html`${element}`;
  }

  static get styles(): CSSResultGroup {
    return [
      MushroomBaseElement.styles,
      css`
        ha-card {
          background: none;
          box-shadow: none;
          border-radius: 0;
          border: none;
        }
        .chip-container {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: var(--chip-spacing);
        }
        .chip-container.align-end {
          justify-content: flex-end;
        }
        .chip-container.align-center {
          justify-content: center;
        }
        /* 
         * justify 布局核心逻辑（手机通知栏风格）：
         * - 使用 CSS Grid 三列布局：左侧固定 | 中间弹性 | 右侧固定
         * - 桌面端：中间区域单行，超出不换行
         * - 移动端：中间区域支持换行
         * - 隐藏的条件元素完全不占用任何空间
         */
        .chip-container.align-justify {
          display: grid;
          grid-template-columns: auto 1fr auto;
          grid-template-areas: "left center right";
          align-items: center;
          width: 100%;
          gap: 8px;
        }
        /* 左侧区域 */
        .chip-container.align-justify > .left-section {
          grid-area: left;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        /* 右侧区域 */
        .chip-container.align-justify > .right-section {
          grid-area: right;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        /* 中间区域：默认单行，不换行 */
        .chip-container.align-justify > .center-wrapper {
          grid-area: center;
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap; /* 桌面端不换行 */
          align-items: center;
          justify-content: center;
          gap: 4px;
          overflow: hidden; /* 超出隐藏 */
        }
        
        /* 移动端响应式：屏幕宽度 ≤ 600px 时启用换行 */
        @media screen and (max-width: 600px) {
          .chip-container.align-justify > .center-wrapper {
            flex-wrap: wrap; /* 移动端换行 */
            overflow: visible;
          }
        }
        
        /* 
         * 条件芯片的关键处理：
         * 使用 display: contents 让隐藏时完全不占位
         * 子元素直接参与父容器布局
         */
        mushroom-conditional-chip {
          display: contents;
        }
        mushroom-conditional-chip[hidden],
        mushroom-conditional-chip:empty {
          display: none !important;
        }
      `,
    ];
  }
}
