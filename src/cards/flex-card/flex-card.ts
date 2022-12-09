import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceCard, LovelaceCardConfig } from "../../ha";
import { MultiToolBaseCard } from "../../ha/base-card";
import { FlexCardConfig } from "./flex-card-config";
import {
    FLEX_COLUMN_CARD_NAME,
    FLEX_ROW_CARD_NAME,
} from "./const";

export class FlexCard extends MultiToolBaseCard implements LovelaceCard {
    private _config!: FlexCardConfig;

    setConfig(config: FlexCardConfig): void {
        this._config = {
            ...config,
        };
    }

    constructor() {
        super();
        this._config = this._config || {};
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }
        return html`
            <ha-card class="muto-flex-row">
                <h1>hello world</h1>
            </ha-card>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            css`
                .muto-flex-row {
                    display: flex;
                    flex-wrap: no-wrap;
                    justify-content: flex-start;
                    align-items: flex-start;
                    gap: 1rem;
                }
            `,
        ];
    }
}

@customElement(FLEX_ROW_CARD_NAME)
export class FlexRowCard extends FlexCard implements LovelaceCard {
    static get styles(): CSSResultGroup {
        return [
            super.styles,
            css`
                .muto-flex-row {
                    flex-direction: row;
                }
            `,
        ];
    }
}

@customElement(FLEX_COLUMN_CARD_NAME)
export class FlexColumnCard extends FlexCard implements LovelaceCard {
    static get styles(): CSSResultGroup {
        return [
            super.styles,
            css`
                .muto-flex-row {
                    flex-direction: column;
                }
            `,
        ];
    }
}
