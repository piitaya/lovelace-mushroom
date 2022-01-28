import {
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { registerCustomCard } from "../../utils/custom-cards";
import { CHIPS_CARD_EDITOR_NAME, CHIPS_CARD_NAME } from "./const";
import "../../shared/chip";
import { BackChip, createChipElement, EntityChip, WeatherChip } from "./chips";
import "./chips";
import "./chips-card-editor";
import { LovelaceChipConfig } from "../../utils/lovelace/chip/types";

export interface ChipsCardConfig extends LovelaceCardConfig {
    chips: LovelaceChipConfig[];
}

registerCustomCard({
    type: CHIPS_CARD_NAME,
    name: "Mushroom Chips Card",
    description: "Card with chips to display informations",
});

@customElement(CHIPS_CARD_NAME)
export class ChipsCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            CHIPS_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        _hass: HomeAssistant
    ): Promise<ChipsCardConfig> {
        const chips = await Promise.all([
            BackChip.getStubConfig(_hass),
            EntityChip.getStubConfig(_hass),
        ]);
        return {
            type: `custom:${CHIPS_CARD_NAME}`,
            chips,
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

    private renderChip(chipConfig: LovelaceChipConfig): TemplateResult {
        const element = createChipElement(chipConfig);
        if (!element) {
            return html``;
        }
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
