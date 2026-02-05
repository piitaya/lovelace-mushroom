import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { HomeAssistant, LovelaceCardFeatureContext } from "../../ha";
import { registerCustomCardFeature } from "../../utils/custom-card-features";
import { CombineFeatureConfig } from "./combine-feature-config";

const COMBINE_FEATURE_NAME = "mushroom-combine-card-feature";

registerCustomCardFeature({
  type: COMBINE_FEATURE_NAME,
  name: "Mushroom Combine",
  supported: () => true,
  configurable: true,
});

@customElement("mushroom-combine-card-feature")
export class MushroomCombineFeature extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public context?: LovelaceCardFeatureContext;

  @property({ attribute: false }) public color?: string;

  @state() private _config?: CombineFeatureConfig;

  @state() private _activeIndex: number = 0;

  static getStubConfig(): CombineFeatureConfig {
    return {
      type: "custom:mushroom-combine-card-feature",
      features: [],
    };
  }

  static async getConfigElement() {
    await import("./combine-feature-editor");
    return document.createElement("mushroom-combine-card-feature-editor");
  }

  setConfig(config: CombineFeatureConfig): void {
    this._config = config;
    this._validateActiveIndex();
  }

  private _validateActiveIndex(): void {
    if (!this._config?.features?.length) {
      this._activeIndex = 0;
      return;
    }
    if (this._activeIndex >= this._config.features.length) {
      this._activeIndex = 0;
    }
  }

  private _onNextTap(e: Event): void {
    e.stopPropagation();
    if (!this._config?.features?.length) return;

    this._activeIndex = (this._activeIndex + 1) % this._config.features.length;
  }

  private _renderCompactMode(): TemplateResult {
    if (!this._config?.features?.length) return html``;

    const featureConfig = this._config.features[this._activeIndex];
    const showNavButton = this._config.features.length > 1;

    return html`
      <div class="container compact">
        <div class="feature-container">
          ${keyed(
            this._activeIndex,
            html`
              <hui-card-feature
                .hass=${this.hass}
                .context=${this.context}
                .color=${this.color}
                .feature=${featureConfig}
              ></hui-card-feature>
            `
          )}
        </div>
        ${showNavButton
          ? html`
              <ha-control-button @click=${this._onNextTap}>
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </ha-control-button>
            `
          : nothing}
      </div>
    `;
  }

  private _renderInlineMode(): TemplateResult {
    if (!this._config?.features?.length) return html``;

    return html`
      <div class="container inline">
        ${this._config.features.map(
          (featureConfig) => html`
            <div class="feature-container">
              <hui-card-feature
                .hass=${this.hass}
                .context=${this.context}
                .color=${this.color}
                .feature=${featureConfig}
              ></hui-card-feature>
            </div>
          `
        )}
      </div>
    `;
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    if (!this._config.features?.length) {
      return html``;
    }

    const layout = this._config.layout || "compact";

    if (layout === "inline") {
      return this._renderInlineMode();
    }

    return this._renderCompactMode();
  }

  static get styles(): CSSResultGroup {
    return css`
      .container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--feature-button-spacing, 12px);
      }
      .feature-container {
        flex: 1;
        min-width: 0;
      }
      ha-control-button {
        --control-button-border-radius: var(--feature-border-radius, 12px);
        --mdc-icon-size: 20px;
        height: var(--feature-height, 42px);
        min-width: var(--feature-height, 42px);
      }
      ha-control-button ha-icon {
        display: flex;
      }
    `;
  }
}
