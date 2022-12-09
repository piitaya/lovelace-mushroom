import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceCard, LovelaceCardConfig } from "../../ha";
import { MultiToolBaseCard } from "../../ha/base-card";
import { ButtonCardConfig } from "./button-card-config";
import {
    BUTTON_CARD_NAME,
} from "./const";


@customElement(BUTTON_CARD_NAME)
export class ButtonCard extends MultiToolBaseCard implements LovelaceCard {
    private _config!: any;

    setConfig(config: ButtonCardConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
        // this.updateControls();
        // this.updateBrightness();
    }
    
    getCardSize(): number | Promise<number> {
        return 1;
    }

    constructor() {
        super();
  
        this._config = this._config || {};
      }

    protected render(): TemplateResult {
        if (!this.hass || !this._config || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name || entity.attributes.friendly_name || "";

        return html`
            <ha-card class="what">
                <h1>hello world</h1>
            </ha-card>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            css`
                .what {
                    aspect-ratio: 1/1;
                    background: #0f0;
                }
            `,
        ];
    }
}
