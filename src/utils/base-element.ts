import { css, CSSResultGroup, LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { atLeastHaVersion, HomeAssistant } from "../ha";
import "../shared/badge-icon";
import "../shared/card";
import "../shared/shape-avatar";
import "../shared/shape-icon";
import "../shared/state-info";
import "../shared/state-item";
import { animations } from "../utils/entity-styles";
import { defaultColorCss, defaultDarkColorCss } from "./colors";
import { themeColorCss, themeVariables } from "./theme";

export function computeDarkMode(hass?: HomeAssistant): boolean {
  if (!hass) return false;
  return (hass.themes as any).darkMode as boolean;
}
export class MushroomBaseElement extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.toggleAttribute(
      "pre-2024-8",
      !atLeastHaVersion(this.hass.config.version, 2024, 8)
    );
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has("hass") && this.hass) {
      const currentDarkMode = computeDarkMode(changedProps.get("hass"));
      const newDarkMode = computeDarkMode(this.hass);
      if (currentDarkMode !== newDarkMode) {
        this.toggleAttribute("dark-mode", newDarkMode);
      }
    }
  }

  static get styles(): CSSResultGroup {
    return [
      animations,
      css`
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
        :host([pre-2024-8]) {
          --spacing: var(--mush-spacing, 12px);
          --control-height: var(--mush-control-height, 40px);
          --control-spacing: var(--mush-spacing, 12px);
          --icon-size: var(--mush-icon-size, 40px);
        }
      `,
    ];
  }
}
