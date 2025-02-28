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

    return html`
      <ha-card>
        <div class="chip-container ${alignment}" ?rtl=${rtl}>
          ${this._config.chips.map((chip) => this.renderChip(chip))}
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
        .chip-container.align-justify {
          justify-content: space-between;
        }
      `,
    ];
  }
}
