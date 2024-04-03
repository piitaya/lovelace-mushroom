import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, nothing, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
    LovelaceLayoutOptions,
    RenderTemplateResult,
    subscribeRenderTemplate,
} from "../../ha";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseElement } from "../../utils/base-element";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { getWeatherSvgIcon } from "../../utils/icons/weather-icon";
import { weatherSVGStyles } from "../../utils/weather";
import { TEMPLATE_CARD_EDITOR_NAME, TEMPLATE_CARD_NAME } from "./const";
import { TemplateCardConfig } from "./template-card-config";

registerCustomCard({
    type: TEMPLATE_CARD_NAME,
    name: "Mushroom Template Card",
    description: "Card for custom rendering with templates",
});

const TEMPLATE_KEYS = [
    "icon",
    "icon_color",
    "badge_color",
    "badge_icon",
    "primary",
    "secondary",
    "picture",
] as const;
type TemplateKey = (typeof TEMPLATE_KEYS)[number];

@customElement(TEMPLATE_CARD_NAME)
export class TemplateCard extends MushroomBaseElement implements LovelaceCard {
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

    @state() private _config?: TemplateCardConfig;

    @state() private _templateResults: Partial<
        Record<TemplateKey, RenderTemplateResult | undefined>
    > = {};

    @state() private _unsubRenderTemplates: Map<TemplateKey, Promise<UnsubscribeFunc>> = new Map();

    @property({ attribute: "in-grid", reflect: true, type: Boolean })
    protected _inGrid = false;

    public getCardSize(): number | Promise<number> {
        let height = 1;
        if (!this._config) return height;
        const appearance = computeAppearance(this._config);
        if (appearance.layout === "vertical") {
            height += 1;
        }
        return height;
    }

    // For backward compatibility
    public getGridSize(): [number | undefined, number | undefined] {
        const { grid_columns, grid_rows } = this.getLayoutOptions();
        return [grid_columns, grid_rows];
    }

    public getLayoutOptions(): LovelaceLayoutOptions {
        this._inGrid = true;
        const options: LovelaceLayoutOptions = {
            grid_columns: 2,
            grid_rows: 1,
        };
        if (!this._config) return options;
        const appearance = computeAppearance(this._config);
        if (appearance.layout === "vertical") {
            options.grid_rows! += 1;
        }
        if (appearance.layout === "horizontal") {
            options.grid_columns = 4;
        }
        if (this._config?.multiline_secondary) {
            options.grid_rows = undefined
        }
        return options;
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
        return this.isTemplate(key)
            ? this._templateResults[key]?.result?.toString()
            : this._config?.[key];
    }

    protected render() {
        if (!this._config || !this.hass) {
            return nothing;
        }

        const icon = this.getValue("icon");
        const iconColor = this.getValue("icon_color");
        const badgeIcon = this.getValue("badge_icon");
        const badgeColor = this.getValue("badge_color");
        const primary = this.getValue("primary");
        const secondary = this.getValue("secondary");
        const picture = this.getValue("picture");

        const multiline_secondary = this._config.multiline_secondary;

        const rtl = computeRTL(this.hass);

        const appearance = computeAppearance({
            fill_container: this._config.fill_container,
            layout: this._config.layout,
            icon_type: Boolean(picture) ? "entity-picture" : Boolean(icon) ? "icon" : "none",
            primary_info: Boolean(primary) ? "name" : "none",
            secondary_info: Boolean(secondary) ? "state" : "none",
        });

        const weatherSvg = getWeatherSvgIcon(icon);

        return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .appearance=${appearance}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        ${picture
                            ? this.renderPicture(picture)
                            : weatherSvg
                            ? html`<div slot="icon">${weatherSvg}</div>`
                            : icon
                            ? this.renderIcon(icon, iconColor)
                            : nothing}
                        ${(icon || picture) && badgeIcon
                            ? this.renderBadgeIcon(badgeIcon, badgeColor)
                            : undefined}
                        <mushroom-state-info
                            slot="info"
                            .primary=${primary}
                            .secondary=${secondary}
                            .multiline_secondary=${multiline_secondary}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                </mushroom-card>
            </ha-card>
        `;
    }

    renderPicture(picture: string): TemplateResult {
        return html`
            <mushroom-shape-avatar
                slot="icon"
                .picture_url=${(this.hass as any).hassUrl(picture)}
            ></mushroom-shape-avatar>
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
            <mushroom-shape-icon style=${styleMap(iconStyle)} slot="icon">
                <ha-state-icon .hass=${this.hass} .icon=${icon}></ha-state-icon>
            </mushroom-shape-icon>
        `;
    }

    renderBadgeIcon(badge: string, badgeColor?: string) {
        const badgeStyle = {};
        if (badgeColor) {
            const iconRgbColor = computeRgbColor(badgeColor);
            badgeStyle["--main-color"] = `rgba(${iconRgbColor})`;
        }
        return html`
            <mushroom-badge-icon
                slot="badge"
                .icon=${badge}
                style=${styleMap(badgeStyle)}
            ></mushroom-badge-icon>
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

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgb(var(--rgb-disabled));
                    --shape-color: rgba(var(--rgb-disabled), 0.2);
                }
                svg {
                    width: var(--icon-size);
                    height: var(--icon-size);
                    display: flex;
                }
                ${weatherSVGStyles}
            `,
        ];
    }
}
