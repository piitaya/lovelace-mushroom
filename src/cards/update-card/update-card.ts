import {
    ActionHandlerEvent,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { computeStateDisplay } from "../../utils/compute-state-display";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { isActive, isAvailable, supportsFeature } from "../../utils/entity";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import { UPDATE_CARD_EDITOR_NAME, UPDATE_CARD_NAME, UPDATE_ENTITY_DOMAINS } from "./const";
import "./controls/update-buttons-control";
import { UpdateCardConfig } from "./update-card-config";
import { UpdateEntity, updateIsInstalling, UPDATE_SUPPORT_INSTALL } from "./utils";

registerCustomCard({
    type: UPDATE_CARD_NAME,
    name: "Mushroom Update Card",
    description: "Card for update entity",
});

@customElement(UPDATE_CARD_NAME)
export class UpdateCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./update-card-editor");
        return document.createElement(UPDATE_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<UpdateCardConfig> {
        const entities = Object.keys(hass.states);
        const updates = entities.filter((e) => UPDATE_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${UPDATE_CARD_NAME}`,
            entity: updates[0],
        };
    }
    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: UpdateCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: UpdateCardConfig): void {
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

        const entityId = this._config.entity;
        const entity = this.hass.states[entityId];

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const layout = getLayoutFromConfig(this._config);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        let stateValue = `${stateDisplay}`;

        console.log(this._config.show_buttons_control);

        const isInstalling = updateIsInstalling(entity as UpdateEntity);

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
                        .disabled=${!isActive(entity)}
                        .icon=${icon}
                        class=${classMap({
                            pulse: isInstalling,
                        })}
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
                        .secondary=${stateValue}
                    ></mushroom-state-info>
                </mushroom-state-item>
                ${this._config.show_buttons_control &&
                supportsFeature(entity, UPDATE_SUPPORT_INSTALL)
                    ? html`
                          <div class="actions">
                              <mushroom-update-buttons-control
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
                    --icon-color: rgb(var(--rgb-state-entity));
                    --shape-color: rgba(var(--rgb-state-entity), 0.2);
                }
                mushroom-shape-icon.pulse {
                    --shape-animation: 1s ease 0s infinite normal none running pulse;
                }
                mushroom-update-buttons-control {
                    flex: 1;
                }
            `,
        ];
    }
}
