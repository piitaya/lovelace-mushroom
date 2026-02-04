import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, nothing, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  HomeAssistant,
  isAvailable,
  isActive,
  LightEntity,
  lightSupportsColor,
} from "../../ha";
import { LightColorFeatureConfig } from "./light-color-feature-config";

const HUE_GRADIENT =
  "hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%)";

export const supportsLightColorFeature = (stateObj: HassEntity): boolean => {
  return (
    stateObj.entity_id.startsWith("light.") &&
    lightSupportsColor(stateObj as LightEntity)
  );
};

@customElement("mushroom-light-color-card-feature")
export class MushroomLightColorFeature extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @state() private _config?: LightColorFeatureConfig;

  static getStubConfig(): LightColorFeatureConfig {
    return {
      type: "custom:mushroom-light-color-card-feature",
      show_hue: true,
      show_saturation: false,
    };
  }

  static async getConfigElement() {
    await import("./light-color-feature-editor");
    return document.createElement("mushroom-light-color-card-feature-editor");
  }

  setConfig(config: LightColorFeatureConfig): void {
    this._config = config;
  }

  private _getCurrentHue(): number {
    const hsColor = (this.stateObj as LightEntity).attributes.hs_color;
    if (hsColor) {
      return hsColor[0];
    }
    return 0;
  }

  private _getCurrentSaturation(): number {
    const hsColor = (this.stateObj as LightEntity).attributes.hs_color;
    if (hsColor) {
      return hsColor[1];
    }
    return 100;
  }

  private _onHueChange(e: CustomEvent): void {
    const hue = (e.target as any).value;
    if (hue === undefined) return;

    const saturation = this._getCurrentSaturation();

    this.hass.callService("light", "turn_on", {
      entity_id: this.stateObj.entity_id,
      hs_color: [hue, saturation],
    });
  }

  private _onSaturationChange(e: CustomEvent): void {
    const saturation = (e.target as any).value;
    if (saturation === undefined) return;

    const hue = this._getCurrentHue();

    this.hass.callService("light", "turn_on", {
      entity_id: this.stateObj.entity_id,
      hs_color: [hue, saturation],
    });
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass || !this.stateObj) {
      return html``;
    }

    const hue = this._getCurrentHue();
    const saturation = this._getCurrentSaturation();
    const showHue = Boolean(this._config.show_hue);
    const showSaturation = Boolean(this._config.show_saturation);

    const disabled = !isAvailable(this.stateObj);
    const showHandle = isActive(this.stateObj);

    const saturationGradient = `hsl(${hue}, 0%, 100%), hsl(${hue}, 100%, 50%)`;

    return html`
      <div class=${classMap({ container: true, dual: showHue && showSaturation })}>
        ${showHue
          ? html`
              <ha-control-slider
                .value=${hue}
                .showHandle=${showHandle}
                .disabled=${disabled}
                min="0"
                max="360"
                mode="cursor"
                tooltip-mode="never"
                @value-changed=${this._onHueChange}
                style=${styleMap({
                  "--gradient": HUE_GRADIENT,
                })}
              ></ha-control-slider>
            `
          : nothing}
        ${showSaturation
          ? html`
              <ha-control-slider
                .value=${saturation}
                .showHandle=${showHandle}
                .disabled=${disabled}
                min="0"
                max="100"
                mode="cursor"
                unit="%"
                .locale=${this.hass.locale}
                @value-changed=${this._onSaturationChange}
                style=${styleMap({
                  "--gradient": saturationGradient,
                })}
              ></ha-control-slider>
            `
          : nothing}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
        width: 100%;
        --feature-height: 42px;
        --feature-border-radius: 12px;
        --feature-button-spacing: 12px;
      }
      .container {
        display: flex;
        width: 100%;
        height: var(--feature-height);
      }
      .container.dual {
        flex-direction: row;
        gap: var(--feature-button-spacing);
      }
      ha-control-slider {
        flex: 1;
        --control-slider-background: -webkit-linear-gradient(
          left,
          var(--gradient)
        );
        --control-slider-background-opacity: 1;
        --control-slider-thickness: var(--feature-height);
        --control-slider-border-radius: var(--feature-border-radius);
      }
    `;
  }
}
