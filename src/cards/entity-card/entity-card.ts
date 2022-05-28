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
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseElement } from "../../utils/base-element";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { stateIcon } from "../../utils/icons/state-icon";
import { computeEntityPicture, computeInfoDisplay } from "../../utils/info";
import { ENTITY_CARD_EDITOR_NAME, ENTITY_CARD_NAME } from "./const";
import { EntityCardConfig } from "./entity-card-config";

registerCustomCard({
    type: ENTITY_CARD_NAME,
    name: "Mushroom Entity Card",
    description: "Card for all entities",
});

@customElement(ENTITY_CARD_NAME)
export class EntityCard extends MushroomBaseElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./entity-card-editor");
        return document.createElement(ENTITY_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<EntityCardConfig> {
        const entities = Object.keys(hass.states);
        return {
            type: `custom:${ENTITY_CARD_NAME}`,
            entity: entities[0],
        };
    }

    @state() private _config?: EntityCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: EntityCardConfig): void {
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

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const picture = computeEntityPicture(entity, appearance.icon_info);

        const primary = computeInfoDisplay(
            appearance.primary_info,
            name,
            stateDisplay,
            entity,
            this.hass
        );

        const secondary = computeInfoDisplay(
            appearance.secondary_info,
            name,
            stateDisplay,
            entity,
            this.hass
        );

        const iconColor = this._config.icon_color;

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
                        ${picture
                            ? this.renderPicture(picture)
                            : this.renderIcon(icon, iconColor, isActive(entity))}
                        ${!isAvailable(entity)
                            ? html`
                                  <mushroom-badge-icon
                                      class="unavailable"
                                      slot="badge"
                                      icon="mdi:help"
                                  ></mushroom-badge-icon>
                              `
                            : null}
                        <mushroom-state-info
                            slot="info"
                            .primary=${primary}
                            .secondary=${secondary}
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

    renderIcon(icon: string, iconColor: string | undefined, active: boolean): TemplateResult {
        const iconStyle = {};
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
