import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import memoizeOne from "memoize-one";
import hash from "object-hash/dist/object_hash";
import {
  actionHandler,
  ActionHandlerEvent,
  atLeastHaVersion,
  computeDomain,
  DOMAINS_TOGGLE,
  handleAction,
  hasAction,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardEditor,
  LovelaceGridOptions,
  RenderTemplateResult,
  subscribeRenderTemplate,
  ActionHandlerOptions,
} from "../../ha";
import { computeCssColor } from "../../ha/common/color/compute-color";
import { isTemplate } from "../../ha/common/string/has-template";
import { CacheManager } from "../../utils/cache-manager";
import { registerCustomCard } from "../../utils/custom-cards";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import {
  BorderAnimation,
  BorderAnimationSpeed,
  migrateTemplateCardConfig,
  TemplateCardConfig,
} from "./template-card-config";
import { getWeatherSvgIcon } from "../../utils/icons/weather-icon";
import { weatherSVGStyles } from "../../utils/weather";

export const getEntityDefaultTileIconAction = (entityId: string) => {
  const domain = computeDomain(entityId);
  const supportsIconAction =
    DOMAINS_TOGGLE.has(domain) ||
    ["button", "input_button", "scene"].includes(domain);

  return supportsIconAction ? "toggle" : "none";
};

registerCustomCard({
  type: "mushroom-template-card",
  name: "Mushroom Template",
  description: "Build your own Mushroom card using templates",
});

const templateCache = new CacheManager<TemplateResults>(1000);

type TemplateResults = Partial<
  Record<string, RenderTemplateResult | undefined>
>;

const TEMPLATE_KEYS = [
  "icon",
  "color",
  "primary",
  "secondary",
  "picture",
  "border_color",
  "badge_icon",
  "badge_color",
  "badge_text",
] as const;

const BORDER_RULE_TEMPLATE_KEYS = ["condition", "color"] as const;

type BorderRuleTemplateKey = (typeof BORDER_RULE_TEMPLATE_KEYS)[number];

// Template keys are either top level keys (e.g. "icon") or border rule keys
// with a path (e.g. "border_rules.0.condition"), as the number of rules is
// not fixed.
const borderRuleTemplateKey = (index: number, key: BorderRuleTemplateKey) =>
  `border_rules.${index}.${key}`;

const computeTemplateValues = (
  config: TemplateCardConfig
): Record<string, string> => {
  const values: Record<string, string> = {};
  TEMPLATE_KEYS.forEach((key) => {
    values[key] = config[key] ?? "";
  });
  config.border_rules?.forEach((rule, index) => {
    BORDER_RULE_TEMPLATE_KEYS.forEach((key) => {
      values[borderRuleTemplateKey(index, key)] = rule?.[key] ?? "";
    });
  });
  return values;
};

// Same values as the template condition of Home Assistant
const isTruthy = (value?: string): boolean => {
  if (value == null) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  if (["true", "yes", "on", "enable"].includes(normalized)) {
    return true;
  }
  const number = Number(normalized);
  return normalized !== "" && !isNaN(number) && number !== 0;
};

const BORDER_ANIMATION_DURATIONS: Record<BorderAnimation, number> = {
  pulse: 2,
  breathe: 3,
  blink: 1,
  spin: 2.5,
};

const BORDER_ANIMATION_SPEED_FACTORS: Record<BorderAnimationSpeed, number> = {
  slow: 1.6,
  normal: 1,
  fast: 0.5,
};

type RenderedBorder = {
  color?: string;
  width?: number;
  animation?: BorderAnimation;
  speed?: BorderAnimationSpeed;
};

export interface LovelaceCardFeatureContext {
  entity_id?: string;
  area_id?: string;
}

@customElement("mushroom-template-card")
export class MushroomTemplateCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./template-card-editor");
    return document.createElement(
      "mushroom-template-card-editor"
    ) as LovelaceCardEditor;
  }

  public static getStubConfig(): TemplateCardConfig {
    return {
      type: `custom:mushroom-template-card`,
      primary: "Hello, {{user}}",
      secondary: "How are you?",
      icon: "mdi:mushroom",
    };
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public layout?: string;

  @state() private _config?: TemplateCardConfig;

  @state() private _templateResults?: TemplateResults;

  @state() private _unsubRenderTemplates: Map<
    string,
    Promise<UnsubscribeFunc>
  > = new Map();

  private _templateValues = memoizeOne(computeTemplateValues);

  public connectedCallback() {
    super.connectedCallback();
    this._tryConnect();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._tryDisconnect();

    if (this._config && this._templateResults) {
      const key = this._computeCacheKey();
      templateCache.set(key, this._templateResults);
    }
  }

  private _computeCacheKey() {
    return hash(this._config);
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    super.willUpdate(_changedProperties);
    if (!this._config) {
      return;
    }

    if (!this._templateResults) {
      const key = this._computeCacheKey();
      if (templateCache.has(key)) {
        this._templateResults = templateCache.get(key)!;
      } else {
        this._templateResults = {};
      }
    }
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this.hass) {
      return;
    }

    this._tryConnect();
  }

  private _getTemplateKeyValue(key: string): string {
    if (!this._config) {
      return "";
    }
    return this._templateValues(this._config)[key] ?? "";
  }

  private async _tryConnect(): Promise<void> {
    if (!this._config) {
      return;
    }
    Object.keys(this._templateValues(this._config)).forEach((key) => {
      this._tryConnectKey(key);
    });
  }

  private async _tryConnectKey(key: string): Promise<void> {
    if (
      this._unsubRenderTemplates.get(key) !== undefined ||
      !this.hass ||
      !this._config
    ) {
      return;
    }

    const value = this._getTemplateKeyValue(key);
    if (!isTemplate(value)) {
      return;
    }
    try {
      const sub = subscribeRenderTemplate(
        this.hass.connection,
        (result) => {
          this._templateResults = {
            ...this._templateResults,
            [key]: result,
          };
        },
        {
          template: value,
          entity_ids: this._config.entity_id,
          variables: {
            config: this._config,
            user: this.hass.user!.name,
            entity: this._config.entity,
            area: this._config.area,
          },
          strict: true,
        }
      );
      this._unsubRenderTemplates.set(key, sub);
      await sub;
    } catch (_err) {
      const result = {
        result: value,
        listeners: {
          all: false,
          domains: [],
          entities: [],
          time: false,
        },
      };
      this._templateResults = {
        ...this._templateResults,
        [key]: result,
      };
      this._unsubRenderTemplates.delete(key);
    }
  }
  private async _tryDisconnect(): Promise<void> {
    Array.from(this._unsubRenderTemplates.keys()).forEach((key) => {
      this._tryDisconnectKey(key);
    });
  }

  private async _tryDisconnectKey(key: string): Promise<void> {
    const unsubRenderTemplate = this._unsubRenderTemplates.get(key);
    if (!unsubRenderTemplate) {
      return;
    }
    this._unsubRenderTemplates.delete(key);

    try {
      const unsub = await unsubRenderTemplate;
      // UnsubscribeFunc is typed `() => void` but resolves a promise that
      // rejects with `not_found` if the subscription is already gone.
      await unsub();
    } catch (err: any) {
      if (err.code === "not_found" || err.code === "template_error") {
        // If we get here, the connection was probably already closed. Ignore.
      } else {
        throw err;
      }
    }
  }

  public setConfig(config: TemplateCardConfig): void {
    const newConfig = migrateTemplateCardConfig(config);

    // Close the subscriptions of templates that changed or no longer exist
    // (e.g. a removed border rule), so they can be reopened with the new
    // config.
    if (this._config) {
      const oldValues = this._templateValues(this._config);
      const newValues = computeTemplateValues(newConfig);
      const contextChanged =
        this._config.entity !== newConfig.entity ||
        this._config.area !== newConfig.area;
      const changedKeys = Object.keys(oldValues).filter(
        (key) => contextChanged || oldValues[key] !== newValues[key]
      );
      if (changedKeys.length > 0) {
        const templateResults = { ...this._templateResults };
        changedKeys.forEach((key) => {
          this._tryDisconnectKey(key);
          delete templateResults[key];
        });
        this._templateResults = templateResults;
      }
    }

    this._config = newConfig;

    if (this._config.entity) {
      if (!this._config.tap_action) {
        this._config.tap_action = { action: "more-info" };
      }
      if (!this._config.icon_tap_action) {
        this._config.icon_tap_action = {
          action: getEntityDefaultTileIconAction(this._config.entity),
        };
      }
    }
  }

  private _featureContext = memoizeOne(
    (config: TemplateCardConfig): LovelaceCardFeatureContext => {
      return {
        entity_id: config.entity,
        area_id: config.area,
      };
    }
  );

  private getValue(key: string) {
    const value = this._getTemplateKeyValue(key);
    return isTemplate(value)
      ? this._templateResults?.[key]?.result?.toString()
      : value;
  }

  public getCardSize(): number {
    const featuresPosition =
      this._config && this._featurePosition(this._config);
    const featureRows = this._config ? this._featureRows(this._config) : 0;

    const hasContent = Boolean(
      this._config?.icon ||
      this._config?.picture ||
      this._config?.primary ||
      this._config?.secondary
    );

    return (
      (hasContent || featuresPosition === "inline" ? 1 : 0) +
      (this._config?.vertical ? 1 : 0) +
      featureRows
    );
  }

  public getGridOptions(): LovelaceGridOptions {
    let columns = 6;
    let rows = 0;

    const hasContent = Boolean(
      this._config?.icon ||
      this._config?.picture ||
      this._config?.primary ||
      this._config?.secondary
    );

    rows = hasContent ? 1 : 0;

    const featurePosition = this._config && this._featurePosition(this._config);
    const featuresCount = this._config?.features?.length || 0;
    if (this._config && featuresCount) {
      if (featurePosition === "inline") {
        columns = 12;
        rows = 1 + this._featureRows(this._config);
      } else {
        rows += featuresCount;
      }
    }

    if (this._config?.vertical) {
      if (
        this._config.primary ||
        (this._config.secondary && !this._config.icon)
      ) {
        rows++;
      }
    }
    if (this._config?.multiline_secondary) {
      return {
        columns,
      };
    }
    return {
      columns,
      rows,
    };
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  private _handleIconAction(ev: CustomEvent) {
    ev.stopPropagation();
    const config = {
      entity: this._config!.entity,
      tap_action: this._config!.icon_tap_action,
      hold_action: this._config!.icon_hold_action,
      double_tap_action: this._config!.icon_double_tap_action,
    };
    handleAction(this, this.hass!, config, ev.detail.action!);
  }

  private get _hasCardAction() {
    return (
      hasAction(this._config?.tap_action) ||
      hasAction(this._config?.hold_action) ||
      hasAction(this._config?.double_tap_action)
    );
  }

  private get _hasIconAction() {
    return (
      hasAction(this._config?.icon_tap_action) ||
      hasAction(this._config?.icon_hold_action) ||
      hasAction(this._config?.icon_double_tap_action)
    );
  }

  private _featurePosition = memoizeOne((config: TemplateCardConfig) => {
    if (config.vertical) {
      return "bottom";
    }
    return config.features_position || "bottom";
  });

  private get _supportsInlineFeaturesBelow(): boolean {
    const haVersion = this.hass?.connection?.haVersion;
    return Boolean(haVersion && atLeastHaVersion(haVersion, 2026, 9));
  }

  private _featureLayout = memoizeOne(
    (
      config: TemplateCardConfig,
      inlineFeaturesBelow: boolean
    ): {
      inline: LovelaceCardFeatureConfig[];
      below: LovelaceCardFeatureConfig[];
      columns: number;
    } => {
      const features = config.features || [];
      const featurePosition = this._featurePosition(config);

      if (featurePosition !== "inline") {
        return { inline: [], below: features, columns: 1 };
      }
      const inline = features.slice(0, 1);
      const below = inlineFeaturesBelow ? features.slice(1) : [];
      return { inline, below, columns: Math.min(below.length, 2) };
    }
  );

  private _featureRows(config: TemplateCardConfig): number {
    const { below, columns } = this._featureLayout(
      config,
      this._supportsInlineFeaturesBelow
    );
    return Math.ceil(below.length / Math.max(columns, 1));
  }

  private _computeBorder(config: TemplateCardConfig): RenderedBorder {
    // The first rule whose condition is true is applied. A rule without
    // condition is always applied.
    const index = (config.border_rules ?? []).findIndex((rule, index) => {
      if (!rule?.condition) {
        return true;
      }
      return isTruthy(this.getValue(borderRuleTemplateKey(index, "condition")));
    });
    const color = this.getValue("border_color");
    if (index === -1) {
      return { color, width: config.border_width };
    }
    const rule = config.border_rules![index];
    return {
      color: this.getValue(borderRuleTemplateKey(index, "color")) || color,
      width: rule.width ?? config.border_width,
      animation: rule.animation,
      speed: rule.speed,
    };
  }

  protected render() {
    if (!this._config || !this.hass) {
      return nothing;
    }

    const icon = this.getValue("icon");
    const color = this.getValue("color");
    const cssColor = color ? computeCssColor(color) : undefined;
    const primary = this.getValue("primary");
    const secondary = this.getValue("secondary");
    const picture = this.getValue("picture");
    const badgeIcon = this.getValue("badge_icon");
    const badgeColor = this.getValue("badge_color");
    const badgeText = this.getValue("badge_text");
    const badgeCssColor = badgeColor ? computeCssColor(badgeColor) : undefined;
    const border = this._computeBorder(this._config);
    const borderCssColor = border.color
      ? computeCssColor(border.color)
      : undefined;
    // Animations are only applied when a border color is set
    const borderAnimation = borderCssColor ? border.animation : undefined;
    const borderAnimationDuration = borderAnimation
      ? BORDER_ANIMATION_DURATIONS[borderAnimation] *
        BORDER_ANIMATION_SPEED_FACTORS[border.speed ?? "normal"]
      : undefined;

    const weatherSvg = getWeatherSvgIcon(icon);

    const style = {
      "--tile-color": cssColor,
      "--ha-card-border-color": borderCssColor,
      "--ha-card-border-width":
        border.width != null ? `${border.width}px` : undefined,
      "--border-animation-color": borderAnimation ? borderCssColor : undefined,
      "--border-animation-duration":
        borderAnimationDuration != null
          ? `${Math.round(borderAnimationDuration * 100) / 100}s`
          : undefined,
    };

    const featurePosition = this._featurePosition(this._config);
    const features = this._featureLayout(
      this._config,
      this._supportsInlineFeaturesBelow
    );

    const multilineSecondary = this._config.multiline_secondary;

    const featureContext = this._featureContext(this._config);

    const featureOnly =
      (features.inline.length > 0 || features.below.length > 0) &&
      !icon &&
      !picture &&
      !primary &&
      !secondary;

    const { haVersion } = this.hass.connection;
    const supportTileIconHandlerOptions = atLeastHaVersion(haVersion, 2026, 2);
    const supportFixedInfoHeight = atLeastHaVersion(haVersion, 2026, 8);

    const fixedInfoHeight =
      supportFixedInfoHeight &&
      this.layout === "grid" &&
      this._config.grid_options?.rows !== "auto";

    const containerClasses = classMap({
      horizontal: featurePosition === "inline",
      "has-features-below":
        featurePosition === "inline" && features.below.length > 0,
      "fixed-height": fixedInfoHeight,
      "feature-only": featureOnly,
    });

    const contentClasses = classMap({
      vertical: Boolean(this._config.vertical),
      "fixed-info-height": fixedInfoHeight,
    });

    const iconActionHandlerOptions: ActionHandlerOptions = {
      disabled: !this._hasIconAction,
      hasHold: hasAction(this._config!.icon_hold_action),
      hasDoubleClick: hasAction(this._config!.icon_double_tap_action),
    };

    return html`
      <ha-card
        class=${borderAnimation ? `border-${borderAnimation}` : ""}
        style=${styleMap(style)}
      >
        <div
          class="background"
          @action=${this._handleAction}
          .actionHandler=${actionHandler({
            disabled: !this._hasCardAction,
            hasHold: hasAction(this._config!.hold_action),
            hasDoubleClick: hasAction(this._config!.double_tap_action),
          })}
          role=${ifDefined(this._hasCardAction ? "button" : undefined)}
          tabindex=${ifDefined(this._hasCardAction ? "0" : undefined)}
          aria-labelledby="info"
        >
          <ha-ripple .disabled=${!this._hasCardAction}></ha-ripple>
        </div>
        <div class="container ${containerClasses}">
          ${icon ||
          picture ||
          primary ||
          secondary ||
          features.inline.length > 0
            ? html`<div class="row">
                ${icon || picture || primary || secondary
                  ? html`<div class="content ${contentClasses}">
                      ${icon || picture
                        ? html`
                            <ha-tile-icon
                              role=${ifDefined(
                                !supportTileIconHandlerOptions &&
                                  this._hasIconAction
                                  ? "button"
                                  : undefined
                              )}
                              tabindex=${ifDefined(
                                !supportTileIconHandlerOptions &&
                                  this._hasIconAction
                                  ? "0"
                                  : undefined
                              )}
                              @action=${this._handleIconAction}
                              .actionHandlerOptions=${supportTileIconHandlerOptions
                                ? iconActionHandlerOptions
                                : undefined}
                              .actionHandler=${!supportTileIconHandlerOptions
                                ? actionHandler(iconActionHandlerOptions)
                                : undefined}
                              .interactive=${this._hasIconAction}
                              .imageUrl=${picture
                                ? this.hass.hassUrl(picture)
                                : undefined}
                              class=${weatherSvg ? "weather" : ""}
                            >
                              ${picture
                                ? nothing
                                : weatherSvg
                                  ? html`<div slot="icon">${weatherSvg}</div>`
                                  : html`<ha-state-icon
                                      slot="icon"
                                      .icon=${icon}
                                      .hass=${this.hass}
                                    ></ha-state-icon>`}
                              ${badgeIcon || badgeText
                                ? html`
                                    <ha-tile-badge
                                      style=${styleMap({
                                        "--badge-color": badgeCssColor,
                                      })}
                                    >
                                      ${badgeText
                                        ? html`<span>${badgeText}</span>`
                                        : html`<ha-icon .icon=${badgeIcon}>
                                          </ha-icon>`}
                                    </ha-tile-badge>
                                  `
                                : nothing}
                            </ha-tile-icon>
                          `
                        : nothing}
                      ${primary || secondary
                        ? html`
                            <ha-tile-info id="info">
                              <span slot="primary">${primary}</span>
                              <span
                                slot="secondary"
                                class=${classMap({
                                  multiline: Boolean(multilineSecondary),
                                })}
                                >${secondary}</span
                              >
                            </ha-tile-info>
                          `
                        : nothing}
                    </div> `
                  : nothing}
                ${features.inline.length > 0
                  ? html`
                      <hui-card-features
                        class="features-inline"
                        .hass=${this.hass}
                        .context=${featureContext}
                        .color=${cssColor}
                        .features=${features.inline}
                        .position=${featurePosition}
                      ></hui-card-features>
                    `
                  : nothing}
              </div>`
            : nothing}
          ${features.below.length > 0
            ? html`
                <hui-card-features
                  class="features-below"
                  .columns=${features.columns}
                  .hass=${this.hass}
                  .context=${featureContext}
                  .color=${cssColor}
                  .features=${features.below}
                  .position=${"bottom"}
                ></hui-card-features>
              `
            : nothing}
        </div>
        ${borderAnimation === "spin"
          ? html`<div class="border-spin-effect"></div>`
          : nothing}
      </ha-card>
    `;
  }

  static styles = [
    weatherSVGStyles,
    css`
      :host {
        --tile-color: var(--state-inactive-color);
        -webkit-tap-highlight-color: transparent;
      }
      ha-card:has(.background:focus-visible) {
        --shadow-default: var(--ha-card-box-shadow, 0 0 0 0 transparent);
        --shadow-focus: 0 0 0 1px var(--tile-color);
        border-color: var(--tile-color);
        box-shadow: var(--shadow-default), var(--shadow-focus);
      }
      ha-card {
        --ha-ripple-color: var(--tile-color);
        --ha-ripple-hover-opacity: 0.04;
        --ha-ripple-pressed-opacity: 0.12;
        height: 100%;
        transition:
          box-shadow 180ms ease-in-out,
          border-color 180ms ease-in-out;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      @media (prefers-reduced-motion: no-preference) {
        ha-card.border-pulse {
          animation: border-pulse var(--border-animation-duration) ease-in-out
            infinite;
        }
        ha-card.border-breathe {
          animation: border-breathe var(--border-animation-duration) ease-in-out
            infinite;
        }
        ha-card.border-blink {
          animation: border-blink var(--border-animation-duration) step-end
            infinite;
        }
        ha-card.border-spin {
          border-color: color-mix(
            in srgb,
            var(--border-animation-color) 25%,
            transparent
          );
        }
        .border-spin-effect {
          position: absolute;
          inset: calc(-1 * var(--ha-card-border-width, 1px));
          padding: var(--ha-card-border-width, 1px);
          box-sizing: border-box;
          border-radius: var(
            --ha-card-border-radius,
            var(--ha-border-radius-lg, 12px)
          );
          overflow: hidden;
          pointer-events: none;
          container-type: size;
          /* Only display the border area */
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
        }
        .border-spin-effect::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 150cqmax;
          height: 150cqmax;
          translate: -50% -50%;
          background: conic-gradient(
            transparent 0deg 240deg,
            var(--border-animation-color) 360deg
          );
          animation: border-spin var(--border-animation-duration) linear
            infinite;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .border-spin-effect {
          display: none;
        }
      }
      @keyframes border-pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 transparent;
        }
        50% {
          box-shadow: 0 0 0 4px
            color-mix(in srgb, var(--border-animation-color) 40%, transparent);
        }
      }
      @keyframes border-breathe {
        0%,
        100% {
          border-color: var(--border-animation-color);
        }
        50% {
          border-color: color-mix(
            in srgb,
            var(--border-animation-color) 15%,
            transparent
          );
        }
      }
      @keyframes border-blink {
        0% {
          border-color: var(--border-animation-color);
          box-shadow: 0 0 0 2px
            color-mix(in srgb, var(--border-animation-color) 40%, transparent);
        }
        50% {
          border-color: color-mix(
            in srgb,
            var(--border-animation-color) 15%,
            transparent
          );
          box-shadow: 0 0 0 0 transparent;
        }
      }
      @keyframes border-spin {
        to {
          rotate: 360deg;
        }
      }
      [role="button"] {
        cursor: pointer;
        pointer-events: auto;
      }
      [role="button"]:focus {
        outline: none;
      }
      .background {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        border-radius: var(
          --ha-card-border-radius,
          var(--ha-border-radius-lg, 12px)
        );
        margin: calc(-1 * var(--ha-card-border-width, 1px));
        overflow: hidden;
      }
      .container {
        margin: calc(-1 * var(--ha-card-border-width, 1px));
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .row {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }
      .container.horizontal .row {
        flex-direction: row;
      }

      .content {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 10px;
        min-height: var(--row-height, 56px);
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
        pointer-events: none;
        gap: 10px;
      }
      .content:has(.multiline) {
        padding-top: 10px;
        padding-bottom: 10px;
      }

      .vertical {
        flex-direction: column;
        text-align: center;
        justify-content: center;
        padding: 10px var(--ha-space-2, 8px);
      }
      .vertical.fixed-info-height {
        gap: 2px;
        --ha-tile-info-gap: 2px;
        --ha-tile-info-primary-line-height: var(--ha-space-4);
        --ha-tile-info-primary-min-height: var(--ha-space-8);
        --ha-tile-info-min-height: var(--ha-space-12);
      }
      .vertical ha-tile-info {
        width: 100%;
        flex: none;
      }

      .multiline {
        white-space: pre-wrap;
      }

      ha-tile-icon {
        --tile-icon-color: var(--tile-color);
        position: relative;
        padding: 6px;
        margin: -6px;
      }
      ha-tile-icon.weather svg {
        width: 36px;
        height: 36px;
        display: flex;
      }
      ha-tile-icon.weather {
        --tile-icon-opacity: 0;
        --tile-icon-hover-opacity: 0;
        --tile-icon-border-radius: 0;
      }
      ha-tile-badge {
        position: absolute;
        top: 3px;
        right: 3px;
        inset-inline-end: 3px;
        inset-inline-start: initial;
        --tile-badge-background-color: var(
          --badge-color,
          var(--secondary-text-color)
        );
      }
      ha-tile-badge span {
        font-size: 0.8rem;
        font-weight: bold;
        height: 16px;
        line-height: 16px;
      }
      ha-tile-info {
        position: relative;
        min-width: 0;
        transition: background-color 180ms ease-in-out;
        box-sizing: border-box;
      }
      hui-card-features {
        --feature-color: var(--tile-color);
        padding: 0 var(--ha-space-3, 12px) var(--ha-space-3, 12px)
          var(--ha-space-3, 12px);
        min-width: 0;
      }
      .container.horizontal .features-inline {
        width: calc(50% - var(--column-gap, 0px) / 2 - var(--ha-space-3, 12px));
        flex: none;
        padding: 0 var(--ha-space-3, 12px);
        padding-inline-start: 0;
      }
      .container.horizontal:not(.has-features-below) .features-inline,
      .container.horizontal:not(.fixed-height) .features-inline {
        --feature-height: var(--ha-space-9, 36px);
      }
      .container.has-features-below .features-below {
        --ha-card-feature-column-gap: calc(
          var(--column-gap, 0px) + var(--ha-space-3, 12px) * 2
        );
        --ha-card-feature-divider: 1px solid
          var(--ha-color-border-neutral-quiet);
        --ha-card-feature-divider-inset: calc(
          var(--ha-space-3, 12px) + var(--column-gap, 0px) / 2
        );
      }
      .container.feature-only {
        justify-content: flex-end;
      }
      .container.feature-only hui-card-features {
        flex: 1;
        width: 100%;
        padding: var(--ha-space-3, 12px);
      }
      .container.feature-only.horizontal .row hui-card-features {
        padding: 0 var(--ha-space-3, 12px);
      }
      .container.feature-only.horizontal .features-below {
        flex: none;
        padding: 0 var(--ha-space-3, 12px) var(--ha-space-3, 12px)
          var(--ha-space-3, 12px);
      }
      .container.horizontal .content:not(:has(ha-tile-info)) {
        flex: none;
      }
      .container.horizontal:not(:has(ha-tile-info)) .row hui-card-features {
        width: auto;
        flex: 1;
      }
      .container.horizontal:not(:has(ha-tile-info)) .content {
        flex: none;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "mushroom-template-card": MushroomTemplateCard;
  }
}
