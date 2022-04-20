import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";
import { Connection, UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { RenderTemplateResult, subscribeRenderTemplate } from "../../utils/ws-templates";
import { TITLE_CARD_EDITOR_NAME, TITLE_CARD_NAME } from "./const";
import { TitleCardConfig } from "./title-card-config";

registerCustomCard({
    type: TITLE_CARD_NAME,
    name: "Mushroom Title Card",
    description: "Title and subtitle to separate sections",
});

const TEMPLATE_KEYS = ["title", "subtitle"] as const;
type TemplateKey = typeof TEMPLATE_KEYS[number];

@customElement(TITLE_CARD_NAME)
export class TitleCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./title-card-editor");
        return document.createElement(TITLE_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(_hass: HomeAssistant): Promise<TitleCardConfig> {
        return {
            type: `custom:${TITLE_CARD_NAME}`,
            title: "Hello, {{ user }} !",
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: TitleCardConfig;

    @state() private _templateResults: Partial<
        Record<TemplateKey, RenderTemplateResult | undefined>
    > = {};

    @state() private _unsubRenderTemplates: Map<TemplateKey, Promise<UnsubscribeFunc>> = new Map();

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: TitleCardConfig): void {
        TEMPLATE_KEYS.forEach((key) => {
            if (this._config?.[key] !== config[key]) {
                this._tryDisconnectKey(key);
            }
        });
        this._config = config;
    }

    public connectedCallback() {
        super.connectedCallback();
        this._tryConnect();
    }

    public disconnectedCallback() {
        this._tryDisconnect();
    }

    public isTemplate(key: TemplateKey) {
        const value = this._config?.[key];
        return value?.includes("{");
    }

    private getValue(key: TemplateKey) {
        return this.isTemplate(key) ? this._templateResults[key]?.result : this._config?.[key];
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const title = this.getValue("title");
        const subtitle = this.getValue("subtitle");
        let alignment = "";
        if (this._config.alignment) {
            alignment = `align-${this._config.alignment}`;
        }

        return html`
            <div class="header ${alignment}">
                ${title ? html`<h1 class="title">${title}</h1>` : null}
                ${subtitle ? html`<h2 class="subtitle">${subtitle}</h2>` : null}
            </div>
        `;
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
        return [
            cardStyle,
            css`
                .header {
                    display: block;
                    padding: var(--title-padding);
                }
                .header * {
                    margin: 0;
                    white-space: pre-wrap;
                }
                .header *:not(:last-child) {
                    margin-bottom: var(--title-spacing);
                }
                .title {
                    color: var(--primary-text-color);
                    font-size: var(--title-font-size);
                    font-weight: var(--title-font-weight);
                    line-height: var(--title-line-height);
                }
                .subtitle {
                    color: var(--secondary-text-color);
                    font-size: var(--subtitle-font-size);
                    font-weight: var(--subtitle-font-weight);
                    line-height: var(--subtitle-line-height);
                }
                .align-start {
                    text-align: start;
                }
                .align-end {
                    text-align: end;
                }
                .align-center {
                    text-align: center;
                }
                .align-justify {
                    text-align: justify;
                }
            `,
        ];
    }
}
