import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    isActive,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import "../../shared/dropdown/tab";
import "../../shared/dropdown/content";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { stateIcon } from "../../utils/icons/state-icon";
import { computeEntityPicture } from "../../utils/info";
import { DROPDOWN_CARD_EDITOR_NAME, DROPDOWN_CARD_NAME } from "./const";
import { DropdownCardConfig } from "./dropdown-card-config";
import { createRow } from "../../utils/lovelace/create-row";

registerCustomCard({
    type: DROPDOWN_CARD_NAME,
    name: "Mushroom Dropdown Card",
    description: "Dropdown card for all entities",
});

@customElement(DROPDOWN_CARD_NAME)
export class DropdownCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./dropdown-card-editor");
        return document.createElement(DROPDOWN_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<DropdownCardConfig> {
        const entities = Object.keys(hass.states);
        return {
            type: `custom:${DROPDOWN_CARD_NAME}`,
            entity: entities[0],
            entities: [entities[1], entities[2], entities[3]],
        };
    }

    @state() private _config?: DropdownCardConfig;
    @state() private open: boolean = false;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (!this._config) return false;
        if (changedProps.has("_config") || changedProps.has("open")) return true;

        if (changedProps.has("hass")) {
            const oldStates = changedProps.get("hass").states;
            const newStates = this.hass.states;
            const entity = this._config.entity;
            const entities = this._config.entities;

            if (entity) {
                const checkEntity = oldStates[entity] !== newStates[entity];
                if (checkEntity) return true;
            }

            if (entities) {
                const checkEntities = entities.map((x) => oldStates[x] !== newStates[x]);
                if (checkEntities.includes(true)) return true;
            }
        }

        return false;
    }

    setConfig(config: DropdownCardConfig): void {
        this._config = {
            tap_action: {
                action: "none",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
        this.open = config.default_open || false;
    }

    private _handleAction(ev: ActionHandlerEvent) {
        if (ev.detail.action === "tap" && this._config?.tap_action?.action === "none") {
            this.open = !this.open;
        } else {
            handleAction(this, this.hass!, this._config!, ev.detail.action!);
        }
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entityId = this._config.entity;
        const entity = this.hass.states[entityId];
        const entities = this._config.entities;

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const appearance = computeAppearance(this._config);

        const picture = computeEntityPicture(entity, appearance.icon_type);

        const rtl = computeRTL(this.hass);

        return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <mushroom-dropdown-tab
                        .open=${this.open}
                        .arrow=${!this._config.hide_arrow}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        <mushroom-state-item ?rtl=${rtl} .appearance=${appearance}>
                            ${picture ? this.renderPicture(picture) : this.renderIcon(entity, icon)}
                            ${this.renderBadge(entity)}
                            ${this.renderStateInfo(entity, appearance, name)};
                        </mushroom-state-item>
                    </mushroom-dropdown-tab>
                    <mushroom-dropdown-content .open=${this.open}>
                        ${entities.map((x) => createRow(this.hass, x))}
                    </mushroom-dropdown-content>
                </mushroom-card>
            </ha-card>
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
                mushroom-dropdown-tab {
                    cursor: pointer;
                    margin-bottom: 0;
                }
                mushroom-shape-icon {
                    --icon-color: rgb(var(--rgb-state-entity));
                    --shape-color: rgba(var(--rgb-state-entity), 0.2);
                }
            `,
        ];
    }
}
