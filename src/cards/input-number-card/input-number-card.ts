import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    isActive,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { stateIcon } from "../../utils/icons/state-icon";
import { computeEntityPicture } from "../../utils/info";
import {
    INPUT_NUMBER_CARD_EDITOR_NAME,
    INPUT_NUMBER_CARD_NAME,
    INPUT_NUMBER_ENTITY_DOMAINS,
} from "./const";
import "./controls/input-number-value-control";
import { InputNumberCardConfig } from "./input-number-card-config";

registerCustomCard({
    type: INPUT_NUMBER_CARD_NAME,
    name: "Mushroom Input Number Card",
    description: "Card for input number entity",
});

@customElement(INPUT_NUMBER_CARD_NAME)
export class InputNumberCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./input-number-card-editor");
        return document.createElement(INPUT_NUMBER_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<InputNumberCardConfig> {
        const entities = Object.keys(hass.states);
        const input_numbers = entities.filter((e) =>
            INPUT_NUMBER_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${INPUT_NUMBER_CARD_NAME}`,
            entity: input_numbers[0],
        };
    }

    @state() private _config?: InputNumberCardConfig;

    @state() private value?: number;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: InputNumberCardConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
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

    private onCurrentValueChange(e: CustomEvent<{ value?: number }>): void {
        if (e.detail.value != null) {
            this.value = e.detail.value;
        } else {
            this.value = undefined;
        }
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const appearance = computeAppearance(this._config);
        const picture = computeEntityPicture(entity, appearance.icon_type);

        let stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);
        if (this.value) {
            stateDisplay = `${this.value} ${entity.attributes.unit_of_measurement ?? ''}`;
        }

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
                        ${this.renderStateInfo(entity, appearance, name, stateDisplay)};
                    </mushroom-state-item>
                    ${isActive(entity)
                        ? html`
                              <div class="actions" ?rtl=${rtl}>
                                  <mushroom-input-number-value-control
                                      .hass=${this.hass}
                                      .entity=${entity}
                                      @current-change=${this.onCurrentValueChange}
                                  ></mushroom-input-number-value-control>
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
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
                    --icon-color: rgb(var(--rgb-state-input-number));
                    --shape-color: rgba(var(--rgb-state-input-number), 0.2);
                }
                mushroom-input-number-value-control {
                    flex: 1;
                }
            `,
        ];
    }
}
