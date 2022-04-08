import {
    ActionHandlerEvent,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { computeStateDisplay } from "../../utils/compute-state-display";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { isActive, isAvailable } from "../../utils/entity";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import { VACUUM_CARD_EDITOR_NAME, VACUUM_CARD_NAME, VACUUM_ENTITY_DOMAINS } from "./const";
import "./controls/vacuum-buttons-control";
import { isCleaning } from "./utils";
import { VacuumCardConfig } from "./vacuum-card-config";

type VacuumCardControl = "buttons_control";

registerCustomCard({
    type: VACUUM_CARD_NAME,
    name: "Mushroom Vacuum Card",
    description: "Card for vacuum entity",
});

@customElement(VACUUM_CARD_NAME)
export class VacuumCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./vacuum-card-editor");
        return document.createElement(VACUUM_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<VacuumCardConfig> {
        const entities = Object.keys(hass.states);
        const vacuums = entities.filter((e) => VACUUM_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${VACUUM_CARD_NAME}`,
            entity: vacuums[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: VacuumCardConfig;

    @state() private _controls: VacuumCardControl[] = [];

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: VacuumCardConfig): void {
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

        const controls: VacuumCardControl[] = [];
        if (this._config?.show_buttons_control) {
            controls.push("buttons_control");
        }

        this._controls = controls;
        this.updateState();
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updateState();
        }
    }

    @state()
    private state?: string;

    updateState() {
        this.state = undefined;
        if (!this._config || !this.hass || !this._config.entity) return;

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        if (!entity) return;
        this.state = computeStateDisplay(this.hass.localize, entity, this.hass.locale);
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
        const icon = this._config.icon || stateIcon(entity);
        const layout = getLayoutFromConfig(this._config);
        const hideState = this._config.hide_state;

        let stateValue = `${this.state}`;

        const active = isCleaning(entity);

        return html`
            <mushroom-card .layout=${layout}>
                <mushroom-state-item
                    .layout=${layout}
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this._config.hold_action),
                        hasDoubleClick: hasAction(this._config.double_tap_action),
                    })}
                >
                    <mushroom-shape-icon
                        slot="icon"
                        .disabled=${!active}
                        .icon=${icon}
                    ></mushroom-shape-icon>
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
                        .primary=${name}
                        .secondary=${!hideState && stateValue}
                    ></mushroom-state-info>
                </mushroom-state-item>
                ${this._controls.length > 0
                    ? html`
                          <div class="actions">
                              <mushroom-vacuum-buttons-control
                                  .hass=${this.hass}
                                  .entity=${entity}
                                  .fill=${layout !== "horizontal"}
                              />
                          </div>
                      `
                    : null}
            </mushroom-card>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgb(var(--rgb-state-vacuum));
                    --shape-color: rgba(var(--rgb-state-vacuum), 0.2);
                }
                mushroom-shape-icon ha-icon {
                    color: red !important;
                }
            `,
        ];
    }
}
