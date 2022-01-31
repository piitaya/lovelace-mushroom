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
import {
    BackChip,
    createChipElement,
    EntityChip,
    LovelaceChip,
    WeatherChip,
} from "./chips";
import "./chips";
import "./chips-card-editor";
import { LovelaceChipConfig } from "../../utils/lovelace/chip/types";
import { cardStyle } from "../../utils/card-styles";

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

    @state() private _config?: ChipsCardConfig;

    private _hass?: HomeAssistant;

    set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.shadowRoot
            ?.querySelectorAll("div > *")
            .forEach((element: unknown) => {
                (element as LovelaceChip).hass = hass;
            });
    }

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: ChipsCardConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this._config || !this._hass) {
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
        if (this._hass) {
            element.hass = this._hass;
        }
        return html`<div>${element}</div>`;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
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
            `,
        ];
    }
}
