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
import { LightSaturationFeatureConfig } from "./light-saturation-feature-config";

const LIGHT_SATURATION_FEATURE_NAME = "mushroom-light-saturation-card-feature";

function supportsLightSaturationFeature(stateObj: HassEntity): boolean {
  return (
    stateObj.entity_id.startsWith("light.") &&
    lightSupportsColor(stateObj as LightEntity)
  );
}

registerCustomCardFeature({
  type: LIGHT_SATURATION_FEATURE_NAME,
  name: "Mushroom Light saturation",
  supported: (stateObj) => supportsLightSaturationFeature(stateObj as HassEntity),
  configurable: false,
});

@customElement("mushroom-light-saturation-card-feature")
export class MushroomLightSaturationFeature extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @state() private _config?: LightSaturationFeatureConfig;

  static getStubConfig(): LightSaturationFeatureConfig {
    return {
      type: "custom:mushroom-light-saturation-card-feature",
    };
  }

  setConfig(config: LightSaturationFeatureConfig): void {
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
    const disabled = !isAvailable(this.stateObj);
    const showHandle = isActive(this.stateObj);

    const saturationGradient = `hsl(${hue}, 0%, 100%), hsl(${hue}, 100%, 50%)`;

    return html`
      <div class="container">
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
