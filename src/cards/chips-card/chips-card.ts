import {
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { registerCustomCard } from "../../utils/custom-cards";
import { CHIPS_CARD_NAME } from "./const";
import "../../shared/chip";
import { ChipConfig, createChipElement } from "./chips";
import "./chips";

export interface ChipsCardConfig extends LovelaceCardConfig {
    chips: ChipConfig[];
}

registerCustomCard({
    type: CHIPS_CARD_NAME,
    name: "Mushroom Chips Card",
    description: "Card with chips to display informations",
});

@customElement(CHIPS_CARD_NAME)
export class ChipsCard extends LitElement implements LovelaceCard {
    public static async getStubConfig(
        _hass: HomeAssistant
    ): Promise<ChipsCardConfig> {
        return {
            type: `custom:${CHIPS_CARD_NAME}`,
            chips: [],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: ChipsCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: ChipsCardConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        return html`
            <div class="container">
                ${this._config.chips.map((chip) => this.renderChip(chip))}
            </div>
        `;
    }

    private renderChip(chipConfig: ChipConfig): TemplateResult {
        const element = createChipElement(chipConfig);
        if (this.hass) {
            element.hass = this.hass;
        }
        return html`${element}`;
    }

    static get styles(): CSSResultGroup {
        return css`
            .container {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                justify-content: flex-start;
                flex-wrap: wrap;
                margin-top: -8px;
            }
            .container * {
                margin-top: 8px;
            }
            .container *:not(:last-child) {
                margin-right: 8px;
            }
        `;
    }
}
