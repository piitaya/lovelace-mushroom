import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import "../shared/badge-icon";
import "../shared/card";
import "../shared/shape-avatar";
import "../shared/shape-icon";
import "../shared/state-info";
import "../shared/state-item";
import { defaultColorCss, defaultDarkColorCss } from "./colors";
import { themeVariables, themeColorCss } from "./theme";

export class MushroomBaseElement extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;

    protected updated(changedProps: PropertyValues): void {
        if (changedProps.has("hass") && this.hass) {
            const darkMode = (this.hass.themes as any).darkMode as boolean;
            this.toggleAttribute("dark-mode", darkMode);
        }
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                ${defaultColorCss}
            }
            :host([dark-mode]) {
                ${defaultDarkColorCss}
            }
            :host {
                ${themeColorCss}
                ${themeVariables}
            }
        `;
    }
}
