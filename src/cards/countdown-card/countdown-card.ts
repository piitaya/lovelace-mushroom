import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    isActive,
    isAvailable,
    isUnknown,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import "../../shared/time-countdown";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { stateIcon } from "../../utils/icons/state-icon";
import { computeEntityPicture, computeInfoDisplay } from "../../utils/info";
import { ENTITY_CARD_EDITOR_NAME, ENTITY_CARD_NAME } from "./const";
import { CountdownCardConfig } from "./countdown-card-config";
import { Appearance } from "../../shared/config/appearance-config";

registerCustomCard({
    type: ENTITY_CARD_NAME,
    name: "Mushroom Countdown Card",
    description: "Card for entity that's state is a timestamp to count down to",
});

@customElement(ENTITY_CARD_NAME)
export class CountdownCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./countdown-card-editor");
        return document.createElement(ENTITY_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<CountdownCardConfig> {
        const entities = Object.keys(hass.states);
        return {
            type: `custom:${ENTITY_CARD_NAME}`,
            entity: entities[0],
        };
    }

    @state() private _config?: CountdownCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: CountdownCardConfig): void {
        this._config = {
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entityId = this._config.entity;
        const entity = this.hass.states[entityId];

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const appearance = computeAppearance(this._config);

        const picture = computeEntityPicture(entity, appearance.icon_type);

        const rtl = computeRTL(this.hass);

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
                        ${picture ? this.renderPicture(picture) : this.renderIcon(entity, icon)}
                        ${this.renderBadge(entity)}
                        ${this.renderStateInfo(entity, appearance, name)};
                    </mushroom-state-item>
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderStateInfo(
        entity: HassEntity,
        appearance: Appearance,
        name: string,
        state?: string
    ): TemplateResult | null {
        const defaultState = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale,
            this.hass.entities,
            this.hass.connection.haVersion
        );
        const displayState = state ?? defaultState;

        let primary: string | TemplateResult | undefined;
        if (appearance.primary_info === "state" && 
            entity.attributes.device_class === "timestamp" &&
            isAvailable(entity) &&
            !isUnknown(entity)
        ) {
            primary = html`
                <mushroom-time-countdown
                    .hass=${this.hass}
                    .datetime=${entity.state}
                    .timeup_message=${this._config?.timeup_message}
                ></mushroom-time-countdown>
                `;
        } else if (appearance.primary_info === "state" &&
            entity.attributes.device_class === "timestamp" &&
            isAvailable(entity) &&
            isUnknown(entity) &&
            this._config?.unknown_message
            ){
                primary = this._config?.unknown_message || displayState
        } else {
            primary = computeInfoDisplay(
                appearance.primary_info,
                name,
                displayState,
                entity,
                this.hass
            );
        }

        let secondary: string | TemplateResult | undefined;
        if (appearance.secondary_info === "state" &&
            entity.attributes.device_class === "timestamp" &&
            isAvailable(entity) &&
            !isUnknown(entity)
        ) {
            secondary = html`
                <mushroom-time-countdown
                    .hass=${this.hass}
                    .datetime=${entity.state}
                    .timeup_message=${this._config?.timeup_message}
                ></mushroom-time-countdown>
                `;
        } else if (appearance.secondary_info === "state" &&
            entity.attributes.device_class === "timestamp" &&
            isAvailable(entity) &&
            isUnknown(entity) &&
            this._config?.unknown_message
            ){
                secondary = this._config?.unknown_message || displayState
        } else {
            secondary = computeInfoDisplay(
                appearance.secondary_info,
                name,
                displayState,
                entity,
                this.hass
            );
        }

        return html`
            <mushroom-state-info
                slot="info"
                .primary=${primary}
                .secondary=${secondary}
            ></mushroom-state-info>
        `;
    }

    renderIcon(entity: HassEntity, icon: string): TemplateResult {
        const active = isActive(entity);
        const iconStyle = {};
        const iconColor = this._config?.icon_color;
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
        }
        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!active}
                .icon=${icon}
                style=${styleMap(iconStyle)}
            ></mushroom-shape-icon>
        `;
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
                    --icon-color: rgb(var(--rgb-state-entity));
                    --shape-color: rgba(var(--rgb-state-entity), 0.2);
                }
            `,
        ];
    }
}
