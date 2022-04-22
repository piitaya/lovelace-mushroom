import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { Connection, UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { getLayoutFromConfig } from "../../utils/layout";
import { RenderTemplateResult, subscribeRenderTemplate } from "../../utils/ws-templates";
import { TEMPLATE_CARD_EDITOR_NAME, TEMPLATE_CARD_NAME } from "./const";
import { TemplateCardConfig } from "./template-card-config";

registerCustomCard({
    type: TEMPLATE_CARD_NAME,
    name: "Mushroom Template Card",
    description: "Card for custom rendering with templates",
});

const TEMPLATE_KEYS = ["icon", "icon_color", "primary", "secondary"] as const;
type TemplateKey = typeof TEMPLATE_KEYS[number];

@customElement(TEMPLATE_CARD_NAME)
export class TemplateCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./template-card-editor");
        return document.createElement(TEMPLATE_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(_hass: HomeAssistant): Promise<TemplateCardConfig> {
        return {
            type: `custom:${TEMPLATE_CARD_NAME}`,
            primary: "Hello, {{user}}",
            secondary: "How are you?",
            icon: "mdi:home",
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: TemplateCardConfig;

    @state() private _templateResults: Partial<
        Record<TemplateKey, RenderTemplateResult | undefined>
    > = {};

    @state() private _unsubRenderTemplates: Map<TemplateKey, Promise<UnsubscribeFunc>> = new Map();

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: TemplateCardConfig): void {
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
            double_tap_action: {
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
        if (!this._config || !this.hass) {
            return html``;
        }

        const icon = this.getValue("icon");
        const iconColor = this.getValue("icon_color");
        const primary = this.getValue("primary");
        const secondary = this.getValue("secondary");

        const hideIcon = !icon;

        const layout = getLayoutFromConfig(this._config);
        const multiline_secondary = this._config.multiline_secondary;

        const iconStyle = {};
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
        }

        const rtl = computeRTL(this.hass);

        return html`
            <mushroom-card .layout=${layout} ?rtl=${rtl}>
                <mushroom-state-item
                    ?rtl=${rtl}
                    .layout=${layout}
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this._config.hold_action),
                        hasDoubleClick: hasAction(this._config.double_tap_action),
                    })}
                    .hide_info=${!primary && !secondary}
                    .hide_icon=${hideIcon}
                >
                    ${!hideIcon ? this.renderIcon(icon, iconColor) : undefined}
                    <mushroom-state-info
                        slot="info"
                        .primary=${primary}
                        .secondary=${secondary}
                        .multiline_secondary=${multiline_secondary}
                    ></mushroom-state-info>
                </mushroom-state-item>
            </mushroom-card>
        `;
    }

    renderIcon(icon: string, iconColor?: string) {
        const iconStyle = {};
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
        }
        return html`
            <mushroom-shape-icon
                style=${styleMap(iconStyle)}
                slot="icon"
                .icon=${icon}
            ></mushroom-shape-icon>
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
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
            `,
        ];
    }
}
