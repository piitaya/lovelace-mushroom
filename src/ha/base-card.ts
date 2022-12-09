import { HassEntity } from "home-assistant-js-websocket";
import { html, TemplateResult, css, CSSResultGroup, LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { HomeAssistant } from "./types";

import { themeVariables, themeColorCss } from "../theme";
import { LovelaceCardConfig } from ".";

export function computeDarkMode(hass?: HomeAssistant): boolean {
    if (!hass) return false;
    return (hass.themes as any).darkMode as boolean;
}
export class MultiToolBaseElement extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (changedProps.has("hass") && this.hass) {
            
        }
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                ${themeColorCss};
                ${themeVariables};
            }
            :host {
                background: #f00;
            }
        `;
    }
}


export class MultiToolBaseCard extends MultiToolBaseElement {
    getCardSize(): number | Promise<number> {
        return 1;
    }

    constructor() {
        super();
    }
}