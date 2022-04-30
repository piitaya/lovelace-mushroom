import {
    ActionHandlerEvent,
    computeRTL,
    computeStateDisplay,
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
import { isAvailable } from "../../ha/data/entity";
import { LockEntity, LOCK_ENTITY_DOMAINS } from "../../ha/data/lock";
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
import { LOCK_CARD_EDITOR_NAME, LOCK_CARD_NAME } from "./const";
import "./controls/lock-buttons-control";
import { LockCardConfig } from "./lock-card-config";
import { isActionPending, isLocked, isUnlocked } from "./utils";

registerCustomCard({
    type: LOCK_CARD_NAME,
    name: "Mushroom Lock Card",
    description: "Card for all lock entities",
});

@customElement(LOCK_CARD_NAME)
export class LockCard extends MushroomBaseElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./lock-card-editor");
        return document.createElement(LOCK_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<LockCardConfig> {
        const entities = Object.keys(hass.states);
        const locks = entities.filter((e) => LOCK_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${LOCK_CARD_NAME}`,
            entity: locks[0],
        };
    }

    @state() private _config?: LockCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: LockCardConfig): void {
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
        const entity = this.hass.states[entityId] as LockEntity;

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const hideState = this._config.hide_state;
        const layout = getLayoutFromConfig(this._config);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const available = isAvailable(entity);

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
                    >
                        ${this.renderIcon(entity, icon, available)}
                        ${!available
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
                            .secondary=${!hideState && stateDisplay}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                    <div class="actions" ?rtl=${rtl}>
                        <mushroom-lock-buttons-control
                            .hass=${this.hass}
                            .entity=${entity}
                            .fill=${layout !== "horizontal"}
                        >
                        </mushroom-lock-buttons-control>
                    </div>
                </mushroom-card>
            </ha-card>
        `;
    }

    renderIcon(entity: LockEntity, icon: string, available: boolean): TemplateResult {
        const iconStyle = {
            "--icon-color": "rgb(var(--rgb-state-lock))",
            "--shape-color": "rgba(var(--rgb-state-lock), 0.2)",
        };

        if (isLocked(entity)) {
            iconStyle["--icon-color"] = `rgb(var(--rgb-state-lock-locked))`;
            iconStyle["--shape-color"] = `rgba(var(--rgb-state-lock-locked), 0.2)`;
        } else if (isUnlocked(entity)) {
            iconStyle["--icon-color"] = `rgb(var(--rgb-state-lock-unlocked))`;
            iconStyle["--shape-color"] = `rgba(var(--rgb-state-lock-unlocked), 0.2)`;
        } else if (isActionPending(entity)) {
            iconStyle["--icon-color"] = `rgb(var(--rgb-state-lock-pending))`;
            iconStyle["--shape-color"] = `rgba(var(--rgb-state-lock-pending), 0.2)`;
        }

        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!available}
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
                mushroom-lock-buttons-control {
                    flex: 1;
                }
            `,
        ];
    }
}
