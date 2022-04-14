import {
    computeRTL,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { registerCustomCard } from "../../utils/custom-cards";
import { CHIPS_CARD_EDITOR_NAME, CHIPS_CARD_NAME } from "./const";
import "../../shared/chip";
import { EntityChip } from "./chips";
import "./chips";
import { LovelaceChip, LovelaceChipConfig } from "../../utils/lovelace/chip/types";
import { cardStyle } from "../../utils/card-styles";
import { createChipElement } from "../../utils/lovelace/chip/chip-element";

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

    public static async getStubConfig(_hass: HomeAssistant): Promise<ChipsCardConfig> {
        const chips = await Promise.all([EntityChip.getStubConfig(_hass)]);
        return {
            type: `custom:${CHIPS_CARD_NAME}`,
            chips,
        };
    }

    @state() private _config?: ChipsCardConfig;

    private _hass?: HomeAssistant;

    set hass(hass: HomeAssistant) {
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

    protected render(): TemplateResult {
        if (!this._config || !this._hass) {
            return html``;
        }

        let alignment = "";
        if (this._config.alignment) {
            alignment = `align-${this._config.alignment}`;
        }

        const rtl = computeRTL(this._hass);

        return html`
            <div class="chip-container ${alignment}" ?rtl=${rtl}>
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
        return html`${element}`;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                .chip-container {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    justify-content: flex-start;
                    flex-wrap: wrap;
                    margin-bottom: calc(-1 * var(--chip-spacing));
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
                .chip-container * {
                    margin-bottom: var(--chip-spacing);
                }
                .chip-container *:not(:last-child) {
                    margin-right: var(--chip-spacing);
                }
                .chip-container[rtl] *:not(:last-child) {
                    margin-right: initial;
                    margin-left: var(--chip-spacing);
                }
            `,
        ];
    }
}
