import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
} from "custom-card-helpers";
import { Connection, UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeRgbColor } from "../../../utils/colors";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import {
    computeChipComponentName,
    computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import { LovelaceChip, TemplateChipConfig } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { RenderTemplateResult, subscribeRenderTemplate } from "../../../utils/ws-templates";

const TEMPLATE_KEYS = ["content", "icon", "icon_color"] as const;
type TemplateKey = typeof TEMPLATE_KEYS[number];

@customElement(computeChipComponentName("template"))
export class TemplateChip extends LitElement implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
        await import("./template-chip-editor");
        return document.createElement(
            computeChipEditorComponentName("template")
        ) as LovelaceChipEditor;
    }

    public static async getStubConfig(_hass: HomeAssistant): Promise<TemplateChipConfig> {
        return {
            type: `template`,
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: TemplateChipConfig;

    @state() private _templateResults: Partial<
        Record<TemplateKey, RenderTemplateResult | undefined>
    > = {};

    @state() private _unsubRenderTemplates: Map<TemplateKey, Promise<UnsubscribeFunc>> = new Map();

    public setConfig(config: TemplateChipConfig): void {
        TEMPLATE_KEYS.forEach((key) => {
            if (this._config?.[key] !== config[key] || this._config?.entity != config.entity) {
                this._tryDisconnectKey(key);
            }
        });
        this._config = {
            tap_action: {
                action: "toggle",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    public connectedCallback() {
        super.connectedCallback();
        this._tryConnect();
    }

    public disconnectedCallback() {
        this._tryDisconnect();
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    public isTemplate(key: TemplateKey) {
        const value = this._config?.[key];
        return value?.includes("{");
    }

    private getValue(key: TemplateKey) {
        return this.isTemplate(key) ? this._templateResults[key]?.result : this._config?.[key];
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const icon = this.getValue("icon");
        const iconColor = this.getValue("icon_color");
        const content = this.getValue("content");

        const rtl = computeRTL(this.hass);

        return html`
            <mushroom-chip
                ?rtl=${rtl}
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(this._config.hold_action),
                    hasDoubleClick: hasAction(this._config.double_tap_action),
                })}
            >
                ${icon ? this.renderIcon(icon, iconColor) : null}
                ${content ? this.renderContent(content) : null}
            </mushroom-chip>
        `;
    }

    protected renderIcon(icon: string, iconColor?: string): TemplateResult {
        const iconStyle = {};
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--color"] = `rgb(${iconRgbColor})`;
        }
        return html`<ha-icon .icon=${icon} style=${styleMap(iconStyle)}></ha-icon>`;
    }

    protected renderContent(content: string): TemplateResult {
        return html`<span>${content}</span>`;
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
                this.hass.connection as any as Connection,
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

    static get styles(): CSSResultGroup {
        return css`
            mushroom-chip {
                cursor: pointer;
            }
            ha-icon {
                color: var(--color);
            }
        `;
    }
}
