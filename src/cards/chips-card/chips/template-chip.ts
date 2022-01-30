import {
    ActionHandlerEvent,
    handleAction,
    HomeAssistant,
} from "custom-card-helpers";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LovelaceChip } from ".";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { TemplateChipConfig } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import {
    RenderTemplateResult,
    subscribeRenderTemplate,
} from "../../../utils/ws-templates";
import {
    computeChipComponentName,
    computeChipEditorComponentName,
} from "../utils";
import "./menu-chip-editor";
import "./template-chip-editor";

const TEMPLATE_KEYS = ["content", "icon"] as const;
type TemplateKey = typeof TEMPLATE_KEYS[number];

@customElement(computeChipComponentName("template"))
export class TemplateChip extends LitElement implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
        return document.createElement(
            computeChipEditorComponentName("template")
        ) as LovelaceChipEditor;
    }

    public static async getStubConfig(
        _hass: HomeAssistant
    ): Promise<TemplateChipConfig> {
        return {
            type: `template`,
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: TemplateChipConfig;

    @state() private _templateResults: Partial<
        Record<TemplateKey, RenderTemplateResult | undefined>
    > = {};

    @state() private _unsubRenderTemplates: Map<
        TemplateKey,
        Promise<UnsubscribeFunc>
    > = new Map();

    public setConfig(config: TemplateChipConfig): void {
        this._config = config;
        TEMPLATE_KEYS.forEach((key) => {
            if (this._config?.[key] !== config[key]) {
                this._tryConnectKey(key);
            }
        });
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

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const icon = this._templateResults["icon"]?.result;
        const content = this._templateResults["content"]?.result;

        return html`
            <mushroom-chip
                @action=${this._handleAction}
                .actionHandler=${actionHandler()}
            >
                ${icon ? html`<ha-icon .icon=${icon}></ha-icon>` : null}
                ${content ? html`<span>${content}</span>` : null}
            </mushroom-chip>
        `;
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
            !this._config
        ) {
            return;
        }

        try {
            this._unsubRenderTemplates.set(
                key,
                subscribeRenderTemplate(
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
                        },
                    }
                )
            );
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
            if (err.code === "not_found") {
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
        `;
    }
}
