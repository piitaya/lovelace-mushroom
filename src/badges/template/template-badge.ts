import { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  PropertyValues,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import hash from "object-hash/dist/object_hash";
import {
  actionHandler,
  ActionHandlerEvent,
  handleAction,
  hasAction,
  HomeAssistant,
  LovelaceBadge,
  LovelaceBadgeEditor,
  RenderTemplateResult,
  subscribeRenderTemplate,
} from "../../ha";
import { computeCssColor } from "../../ha/common/color/compute-color";
import { registerCustomBadge } from "../../utils/custom-badges";
import { getWeatherSvgIcon } from "../../utils/icons/weather-icon";
import { weatherSVGStyles } from "../../utils/weather";
import { TEMPLATE_BADGE_EDITOR_NAME, TEMPLATE_BADGE_NAME } from "./const";
import { TemplateBadgeConfig } from "./template-badge-config";
import { CacheManager } from "../../utils/cache-manager";

const templateCache = new CacheManager<TemplateResults>(1000);

type TemplateResults = Partial<
  Record<TemplateKey, RenderTemplateResult | undefined>
>;

registerCustomBadge({
  type: TEMPLATE_BADGE_NAME,
  name: "Mushroom Template",
  description: "Build your own badge using templates",
});

const TEMPLATE_KEYS = ["icon", "color", "label", "content", "picture"] as const;
type TemplateKey = (typeof TEMPLATE_KEYS)[number];

@customElement(TEMPLATE_BADGE_NAME)
export class HuiEntityBadge extends LitElement implements LovelaceBadge {
  public static async getConfigElement(): Promise<LovelaceBadgeEditor> {
    await import("./template-badge-editor");
    return document.createElement(
      TEMPLATE_BADGE_EDITOR_NAME
    ) as LovelaceBadgeEditor;
  }

  public static async getStubConfig(
    _hass: HomeAssistant
  ): Promise<TemplateBadgeConfig> {
    return {
      type: `custom:${TEMPLATE_BADGE_NAME}`,
      content: "Hello",
      icon: "mdi:mushroom",
      color: "red",
    };
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() protected _config?: TemplateBadgeConfig;

  @state() private _templateResults?: TemplateResults;

  @state() private _unsubRenderTemplates: Map<
    TemplateKey,
    Promise<UnsubscribeFunc>
  > = new Map();

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

  private async _tryConnect(): Promise<void> {
    TEMPLATE_KEYS.forEach((key) => {
      this._tryConnectKey(key);
    });
  }

  private async _tryConnectKey(key: TemplateKey): Promise<void> {
    if (
      this._unsubRenderTemplates.get(key) !== undefined ||
      !this.hass ||
      !this._config ||
      !this.isTemplate(key)
    ) {
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
          template: this._config[key] ?? "",
          entity_ids: this._config.entity_id,
          variables: {
            config: this._config,
            user: this.hass.user!.name,
            entity: this._config.entity,
          },
          strict: true,
        }
      );
      this._unsubRenderTemplates.set(key, sub);
      await sub;
    } catch (_err) {
      const result = {
        result: this._config[key] ?? "",
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
    TEMPLATE_KEYS.forEach((key) => {
      this._tryDisconnectKey(key);
    });
  }

  private async _tryDisconnectKey(key: TemplateKey): Promise<void> {
    const unsubRenderTemplate = this._unsubRenderTemplates.get(key);
    if (!unsubRenderTemplate) {
      return;
    }

    try {
      const unsub = await unsubRenderTemplate;
      unsub();
      this._unsubRenderTemplates.delete(key);
    } catch (err: any) {
      if (err.code === "not_found" || err.code === "template_error") {
        // If we get here, the connection was probably already closed. Ignore.
      } else {
        throw err;
      }
    }
  }

  setConfig(config: TemplateBadgeConfig): void {
    TEMPLATE_KEYS.forEach((key) => {
      if (
        this._config?.[key] !== config[key] ||
        this._config?.entity != config.entity
      ) {
        this._tryDisconnectKey(key);
      }
    });
    this._config = {
      tap_action: {
        action: "none",
      },
      ...config,
    };
  }

  get hasAction() {
    return (
      !this._config?.tap_action ||
      hasAction(this._config?.tap_action) ||
      hasAction(this._config?.hold_action) ||
      hasAction(this._config?.double_tap_action)
    );
  }

  protected render() {
    if (!this._config || !this.hass) {
      return nothing;
    }

    const icon = this.getValue("icon");
    const color = this.getValue("color");
    const content = this.getValue("content");
    const label = this.getValue("label");
    const picture = this.getValue("picture");

    const hasInfo = !!content;
    const hasIcon = !!icon || !!picture;

    const style = {};
    if (color) {
      style["--badge-color"] = computeCssColor(color);
    }

    const weatherSvg = getWeatherSvgIcon(icon);

    return html`
      <div
        style=${styleMap(style)}
        class="badge ${classMap({
          "no-info": !hasInfo,
          "no-icon": !hasIcon,
        })}"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config!.hold_action),
          hasDoubleClick: hasAction(this._config!.double_tap_action),
        })}
        role=${ifDefined(this.hasAction ? "button" : undefined)}
        tabindex=${ifDefined(this.hasAction ? "0" : undefined)}
      >
        <ha-ripple .disabled=${!this.hasAction}></ha-ripple>
        ${picture
          ? html`<img src=${picture} aria-hidden="true" />`
          : weatherSvg
            ? weatherSvg
            : icon
              ? html`
                  <ha-state-icon
                    .hass=${this.hass}
                    .icon=${icon}
                  ></ha-state-icon>
                `
              : nothing}
        ${content
          ? html`
              <span class="info">
                ${label ? html`<span class="label">${label}</span>` : nothing}
                <span class="content">${content}</span>
              </span>
            `
          : nothing}
      </div>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  public isTemplate(key: TemplateKey) {
    const value = this._config?.[key];
    return value?.includes("{");
  }

  private getValue(key: TemplateKey) {
    return this.isTemplate(key)
      ? this._templateResults?.[key]?.result?.toString()
      : this._config?.[key];
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        -webkit-tap-highlight-color: transparent;
      }
      .badge {
        position: relative;
        --ha-ripple-color: var(--badge-color);
        --ha-ripple-hover-opacity: 0.04;
        --ha-ripple-pressed-opacity: 0.12;
        transition:
          box-shadow 180ms ease-in-out,
          border-color 180ms ease-in-out;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: var(--ha-badge-size, 36px);
        min-width: var(--ha-badge-size, 36px);
        padding: 0px 8px;
        box-sizing: border-box;
        width: auto;
        border-radius: var(
          --ha-badge-border-radius,
          calc(var(--ha-badge-size, 36px) / 2)
        );
        background: var(
          --ha-card-background,
          var(--card-background-color, white)
        );
        -webkit-backdrop-filter: var(--ha-card-backdrop-filter, none);
        backdrop-filter: var(--ha-card-backdrop-filter, none);
        border-width: var(--ha-card-border-width, 1px);
        box-shadow: var(--ha-card-box-shadow, none);
        border-style: solid;
        border-color: var(
          --ha-card-border-color,
          var(--divider-color, #e0e0e0)
        );
        --mdc-icon-size: 18px;
        text-align: center;
      }
      .badge:focus-visible {
        --shadow-default: var(--ha-card-box-shadow, 0 0 0 0 transparent);
        --shadow-focus: 0 0 0 1px var(--badge-color);
        border-color: var(--badge-color);
        box-shadow: var(--shadow-default), var(--shadow-focus);
      }
      button,
      [role="button"] {
        cursor: pointer;
      }
      button:focus,
      [role="button"]:focus {
        outline: none;
      }
      .info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding-right: 4px;
        padding-inline-end: 4px;
        padding-inline-start: initial;
      }
      .label {
        font-size: 10px;
        font-style: normal;
        font-weight: 500;
        line-height: 10px;
        letter-spacing: 0.1px;
        color: var(--secondary-text-color);
      }
      .content {
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: 16px;
        letter-spacing: 0.1px;
        color: var(--primary-text-color);
      }
      svg {
        width: var(--mdc-icon-size);
        height: var(--mdc-icon-size);
        display: flex;
      }
      ha-state-icon {
        color: var(--badge-color);
        line-height: 0;
      }
      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
        overflow: hidden;
      }
      .badge.no-info {
        padding: 0;
      }
      .badge:not(.no-icon):not(.no-info) img {
        margin-left: -6px;
        margin-inline-start: -6px;
        margin-inline-end: initial;
      }
      .badge.no-icon .info {
        padding-right: 4px;
        padding-left: 4px;
        padding-inline-end: 4px;
        padding-inline-start: 4px;
      }
      ${weatherSVGStyles}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-entity-badge": HuiEntityBadge;
  }
}
