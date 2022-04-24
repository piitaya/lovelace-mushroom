import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { isActive, isAvailable } from "../../ha/data/entity";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/status-bar";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { stateIcon as stateIconHelper } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import { PLANT_CARD_EDITOR_NAME, PLANT_CARD_NAME, PLANT_ENTITY_DOMAINS } from "./const";
import { PlantCardConfig } from "./plant-card-config";
import { computePlantState } from "./utils";

registerCustomCard({
    type: PLANT_CARD_NAME,
    name: "Mushroom Plant Card",
    description: "Card for plant entity",
});

@customElement(PLANT_CARD_NAME)
export class PlantCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./plant-card-editor");
        return document.createElement(PLANT_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<PlantCardConfig> {
        const entities = Object.keys(hass.states);
        const people = entities.filter((e) => PLANT_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${PLANT_CARD_NAME}`,
            entity: people[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: PlantCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: PlantCardConfig): void {
        this._config = {
            tap_action: {
                action: "more-info",
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

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name || entity.attributes.friendly_name;
        const icon = this._config.icon || stateIconHelper(entity);

        const limits = entity.attributes?.limits || {
            min_temperature: 5,
            max_temperature: 35,
            min_moisture: 20,
            max_moisture: 60,
            min_conductivity: 500,
            max_conductivity: 3000,
            min_brightness: 2500,
            max_brightness: 30000,
        };

        const picture = this._config.use_entity_picture
            ? entity.attributes.image || entity.attributes.entity_picture
            : undefined;

        const layout = getLayoutFromConfig(this._config);
        const hideState = !!this._config.hide_state;
        const hideName = !!this._config.hide_name;

        const problemIcon = "mdi:exclamation-thick";
        const stateColor = "var(--rgb-state-plant-problem)";

        const stateDisplay = computePlantState(entity);

        const rtl = computeRTL(this.hass);

        return html`
            <mushroom-card .layout=${layout} ?rtl=${rtl}>
                <div class="container">
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .layout=${layout}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        ${picture
                            ? html`
                                  <mushroom-shape-avatar
                                      slot="icon"
                                      .picture_url=${picture}
                                  ></mushroom-shape-avatar>
                              `
                            : html`
                                  <mushroom-shape-icon
                                      slot="icon"
                                      .icon=${icon}
                                  ></mushroom-shape-icon>
                              `}
                        ${isAvailable(entity)
                            ? isActive(entity)
                                ? this.renderStateBadge(problemIcon, stateColor)
                                : null
                            : this.renderUnavailableBadge()}
                        <mushroom-state-info
                            slot="info"
                            .primary=${!hideName ? name : undefined}
                            .secondary=${!hideState && stateDisplay}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                    <div class="attributes">
                        <mushroom-status-bar
                            .entity=${entity}
                            icon="mdi:thermometer"
                            attr="temperature"
                            .min=${limits["min_temperature"]}
                            .max=${limits["max_temperature"]}
                        ></mushroom-status-bar>
                        <mushroom-status-bar
                            .entity=${entity}
                            icon="mdi:white-balance-sunny"
                            attr="brightness"
                            .min=${limits["min_brightness"]}
                            .max=${limits["max_brightness"]}
                        ></mushroom-status-bar>
                        <mushroom-status-bar
                            .entity=${entity}
                            icon="mdi:water-percent"
                            attr="moisture"
                            .min=${limits["min_moisture"]}
                            .max=${limits["max_moisture"]}
                        ></mushroom-status-bar>
                        <mushroom-status-bar
                            .entity=${entity}
                            icon="mdi:leaf"
                            attr="conductivity"
                            .min=${limits["min_conductivity"]}
                            .max=${limits["max_conductivity"]}
                        ></mushroom-status-bar>
                    </div>
                </div>
            </mushroom-card>
        `;
    }

    renderStateBadge(icon: string, color: string) {
        return html`
            <mushroom-badge-icon
                slot="badge"
                .icon=${icon}
                style=${styleMap({
                    "--main-color": `rgb(${color})`,
                })}
            ></mushroom-badge-icon>
        `;
    }

    renderUnavailableBadge() {
        return html`
            <mushroom-badge-icon
                class="unavailable"
                slot="badge"
                icon="mdi:help"
            ></mushroom-badge-icon>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                .attributes {
                    white-space: nowrap;
                    padding-top: 10px;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    grid-template-rows: repeat(2, minmax(0, 1fr));
                }
            `,
        ];
    }
}
