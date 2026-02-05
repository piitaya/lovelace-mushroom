import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  HomeAssistant,
  isAvailable,
  isActive,
  LightEntity,
  lightSupportsColor,
} from "../../ha";
import { registerCustomCardFeature } from "../../utils/custom-card-features";
import { LightHueFeatureConfig } from "./light-hue-feature-config";

const LIGHT_HUE_FEATURE_NAME = "mushroom-light-hue-card-feature";

const HUE_GRADIENT =
  "hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%)";

function supportsLightHueFeature(stateObj: HassEntity): boolean {
  return (
    stateObj.entity_id.startsWith("light.") &&
    lightSupportsColor(stateObj as LightEntity)
  );
}

registerCustomCardFeature({
  type: LIGHT_HUE_FEATURE_NAME,
  name: "Mushroom Light hue",
  supported: (stateObj) => supportsLightHueFeature(stateObj as HassEntity),
  configurable: false,
});

@customElement("mushroom-light-hue-card-feature")
export class MushroomLightHueFeature extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @state() private _config?: LightHueFeatureConfig;

  static getStubConfig(): LightHueFeatureConfig {
    return {
      type: "custom:mushroom-light-hue-card-feature",
    };
  }

  setConfig(config: LightHueFeatureConfig): void {
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

  protected render(): TemplateResult {
    if (!this._config || !this.hass || !this.stateObj) {
      return html``;
    }

    const hue = this._getCurrentHue();
    const disabled = !isAvailable(this.stateObj);
    const showHandle = isActive(this.stateObj);

    return html`
      <div class="container">
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
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
        width: 100%;
      }
      .container {
        display: flex;
        width: 100%;
        height: var(--feature-height);
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
