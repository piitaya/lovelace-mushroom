import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeStateDisplay } from "../../ha/common/entity/compute-state-display";
import { isActive, isAvailable } from "../../ha/data/entity";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { MushroomBaseElement } from "../../utils/base-element";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { stateIcon } from "../../utils/icons/state-icon";
import { getInfo } from "../../utils/info";
import { getLayoutFromConfig } from "../../utils/layout";
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
        const hideIcon = !!this._config.hide_icon;
        const layout = getLayoutFromConfig(this._config);

        const picture = this._config.use_entity_picture
            ? entity.attributes.entity_picture
            : undefined;

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const primary = getInfo(
            this._config.primary_info ?? "name",
            name,
            stateDisplay,
            entity,
            this.hass
        );
        const secondary = getInfo(
            this._config.secondary_info ?? "state",
            name,
            stateDisplay,
            entity,
            this.hass
        );

        const iconColor = this._config.icon_color;

        const rtl = computeRTL(this.hass);

        return html`
            <ha-card class=${classMap({ "fill-container": this._config.fill_container ?? false })}>
                <mushroom-card .layout=${layout} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .layout=${layout}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                        .hide_info=${primary == null && secondary == null}
                        .hide_icon=${hideIcon}
                    >
                        ${picture
                            ? html`
                                  <mushroom-shape-avatar
                                      slot="icon"
                                      .picture_url=${picture}
                                  ></mushroom-shape-avatar>
                              `
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
