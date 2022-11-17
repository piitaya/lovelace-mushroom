import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    ActionHandlerEvent,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
    VacuumEntity,
    actionHandler,
    computeRTL,
    handleAction,
    hasAction,
    isActive,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { stateIcon } from "../../utils/icons/state-icon";
import { computeEntityPicture } from "../../utils/info";
import { VACUUM_CARD_EDITOR_NAME, VACUUM_CARD_NAME, VACUUM_ENTITY_DOMAINS } from "./const";
import "./controls/vacuum-commands-control";
import { isCommandsControlVisible } from "./controls/vacuum-commands-control";
import { VacuumCardConfig } from "./vacuum-card-config";
import { HassEntity } from "home-assistant-js-websocket";
import { isCleaning, isReturningHome } from "./utils";

registerCustomCard({
    type: VACUUM_CARD_NAME,
    name: "Mushroom Vacuum Card",
    description: "Card for vacuum entity",
});

@customElement(VACUUM_CARD_NAME)
export class VacuumCard extends MushroomBaseCard implements LovelaceCard {
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

    @state() private _config?: VacuumCardConfig;

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
        const entity = this.hass.states[entity_id] as VacuumEntity;

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const appearance = computeAppearance(this._config);
        const picture = computeEntityPicture(entity, appearance.icon_type);

        const rtl = computeRTL(this.hass);

        const commands = this._config?.commands ?? [];

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
                    ${isCommandsControlVisible(entity, commands)
                        ? html`
                              <div class="actions" ?rtl=${rtl}>
                                  <mushroom-vacuum-commands-control
                                      .hass=${this.hass}
                                      .entity=${entity}
                                      .commands=${commands}
                                      .fill=${appearance.layout !== "horizontal"}
                                  >
                                  </mushroom-vacuum-commands-control>
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderIcon(entity: HassEntity, icon: string): TemplateResult {
        return html`
            <mushroom-shape-icon
                slot="icon"
                class=${classMap({
                    returning: isReturningHome(entity) && Boolean(this._config?.icon_animation),
                    cleaning: isCleaning(entity) && Boolean(this._config?.icon_animation),
                })}
                style=${styleMap({})}
                .disabled=${!isActive(entity)}
                .icon=${icon}
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
                    --icon-color: rgb(var(--rgb-state-vacuum));
                    --shape-color: rgba(var(--rgb-state-vacuum), 0.2);
                }
                mushroom-shape-icon.cleaning {
                    --icon-animation: 5s infinite linear cleaning;
                }
                mushroom-shape-icon.returning {
                    --icon-animation: 2s infinite linear returning;
                }
                mushroom-vacuum-commands-control {
                    flex: 1;
                }
            `,
        ];
    }
}
