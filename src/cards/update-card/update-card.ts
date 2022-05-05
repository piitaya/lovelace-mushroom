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
import { supportsFeature } from "../../ha/common/entity/supports-feature";
import { isActive, isAvailable } from "../../ha/data/entity";
import { UpdateEntity, updateIsInstalling, UPDATE_SUPPORT_INSTALL } from "../../ha/data/update";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { MushroomBaseElement } from "../../utils/base-element";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import { UPDATE_CARD_EDITOR_NAME, UPDATE_CARD_NAME, UPDATE_ENTITY_DOMAINS } from "./const";
import "./controls/update-buttons-control";
import { UpdateCardConfig } from "./update-card-config";
import { getStateColor } from "./utils";

registerCustomCard({
    type: UPDATE_CARD_NAME,
    name: "Mushroom Update Card",
    description: "Card for update entity",
});

@customElement(UPDATE_CARD_NAME)
export class UpdateCard extends MushroomBaseElement implements LovelaceCard {
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
        const entity = this.hass.states[entityId] as UpdateEntity;

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const picture = this._config.use_entity_picture
            ? entity.attributes.entity_picture
            : undefined;

        const layout = getLayoutFromConfig(this._config);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        let stateValue = `${stateDisplay}`;

        const rtl = computeRTL(this.hass);

        const displayControls =
            (!this._config.collapsible_controls || isActive(entity)) &&
            this._config.show_buttons_control &&
            supportsFeature(entity, UPDATE_SUPPORT_INSTALL);

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
                    >
                        ${picture
                            ? html`
                                  <mushroom-shape-avatar
                                      slot="icon"
                                      .picture_url=${picture}
                                  ></mushroom-shape-avatar>
                              `
                            : this.renderShapeIcon(entity, icon)}
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
                    ${displayControls
                        ? html`
                              <div class="actions" ?rtl=${rtl}>
                                  <mushroom-update-buttons-control
                                      .hass=${this.hass}
                                      .entity=${entity}
                                      .fill=${layout !== "horizontal"}
                                  />
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderShapeIcon(entity: UpdateEntity, icon: string): TemplateResult {
        const isInstalling = updateIsInstalling(entity);

        const color = getStateColor(entity.state, isInstalling);

        const style = {
            "--icon-color": `rgb(${color})`,
            "--shape-color": `rgba(${color}, 0.2)`,
        };

        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!isAvailable(entity)}
                .icon=${icon}
                class=${classMap({
                    pulse: isInstalling,
                })}
                style=${styleMap(style)}
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
