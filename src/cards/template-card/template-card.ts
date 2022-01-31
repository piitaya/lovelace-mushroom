import {
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import {
    css,
    CSSResultGroup,
    html,
    LitElement,
    PropertyValues,
    TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { TEMPLATE_CARD_EDITOR_NAME, TEMPLATE_CARD_NAME } from "./const";
import { TemplateCardConfig } from "./template-card-config";
import "./template-card-editor";
import {
    RenderTemplateResult,
    subscribeRenderTemplate,
} from "../../utils/ws-templates";
import { UnsubscribeFunc } from "home-assistant-js-websocket";

registerCustomCard({
    type: TEMPLATE_CARD_NAME,
    name: "Mushroom Template Card",
    description: "Card for custom rendering with templates",
});

const TEMPLATE_KEYS = ["state", "icon", "name"] as const;
type TemplateKey = typeof TEMPLATE_KEYS[number];

@customElement(TEMPLATE_CARD_NAME)
export class TemplateCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            TEMPLATE_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        _hass: HomeAssistant
    ): Promise<TemplateCardConfig> {
        return {
            type: `custom:${TEMPLATE_CARD_NAME}`,
            name: "Hello, {{user}}",
            state: "How are you?",
            icon: "mdi:home",
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: TemplateCardConfig;

    @state() private _templateResults: Partial<
        Record<TemplateKey, RenderTemplateResult | undefined>
    > = {};

    @state() private _unsubRenderTemplates: Map<
        TemplateKey,
        Promise<UnsubscribeFunc>
    > = new Map();

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: TemplateCardConfig): void {
        TEMPLATE_KEYS.forEach((key) => {
            if (this._config?.[key] !== config[key]) {
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

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const name = this._templateResults.name?.result;
        const icon = this._templateResults.icon?.result;
        const state = this._templateResults.state?.result;

        const vertical = this._config.vertical;

        return html`<ha-card>
            <div class="container">
                <mushroom-state-item
                    .vertical=${vertical}
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this._config.hold_action),
                    })}
                >
                    <mushroom-shape-icon
                        slot="icon"
                        .icon=${icon}
                    ></mushroom-shape-icon>
                    <mushroom-state-info
                        slot="info"
                        .label=${name}
                        .value=${state}
                        hide_state=${!state}
                    ></mushroom-state-info>
                </mushroom-state-item>
            </div>
        </ha-card>`;
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
        return [
            cardStyle,
            css`
                :host {
                    --rgb-color: 61, 90, 254;
                }
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgba(var(--rgb-color), 1);
                    --shape-color: rgba(var(--rgb-color), 0.2);
                }
            `,
        ];
    }
}
