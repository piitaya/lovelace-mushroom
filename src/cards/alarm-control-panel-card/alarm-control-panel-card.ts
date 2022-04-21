import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeStateDisplay } from "../../ha/common/entity/compute-state-display";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import "../../shared/button";
import "../../shared/button-group";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { alarmPanelIconAction } from "../../utils/icons/alarm-panel-icon";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import { AlarmControlPanelCardConfig } from "./alarm-control-panel-card-config";
import {
    ALARM_CONTROl_PANEL_CARD_EDITOR_NAME,
    ALARM_CONTROl_PANEL_CARD_NAME,
    ALARM_CONTROl_PANEL_ENTITY_DOMAINS,
} from "./const";
import {
    getStateColor,
    getStateService,
    hasCode,
    isActionsAvailable,
    isDisarmed,
    shouldPulse,
} from "./utils";
import { isAvailable } from "../../ha/data/entity";

registerCustomCard({
    type: ALARM_CONTROl_PANEL_CARD_NAME,
    name: "Mushroom Alarm Control Panel Card",
    description: "Card for alarm control panel",
});

type ActionButtonType = {
    state: string;
    disabled?: boolean;
};

type HaTextField = any;

const BUTTONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "clear"];

/*
 * Ref: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-alarm-panel-card.ts
 * TODO: customize icon for modes (advanced YAML configuration)
 */

@customElement(ALARM_CONTROl_PANEL_CARD_NAME)
export class AlarmControlPanelCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./alarm-control-panel-card-editor");
        return document.createElement(ALARM_CONTROl_PANEL_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<AlarmControlPanelCardConfig> {
        const entities = Object.keys(hass.states);
        const panels = entities.filter((e) =>
            ALARM_CONTROl_PANEL_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${ALARM_CONTROl_PANEL_CARD_NAME}`,
            entity: panels[0],
            states: ["armed_home", "armed_away"],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: AlarmControlPanelCardConfig;

    @query("#alarmCode") private _input?: HaTextField;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: AlarmControlPanelCardConfig): void {
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
        this.loadComponents();
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.loadComponents();
        }
    }

    async loadComponents() {
        if (!this._config || !this.hass || !this._config.entity) return;
        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        if (hasCode(entity)) {
            void import("../../shared/form/mushroom-textfield");
        }
    }

    private _onTap(e: MouseEvent, state: string): void {
        const service = getStateService(state);
        if (!service) return;
        e.stopPropagation();
        const code = this._input?.value || undefined;
        this.hass.callService("alarm_control_panel", service, {
            entity_id: this._config?.entity,
            code,
        });
        if (this._input) {
            this._input.value = "";
        }
    }

    private _handlePadClick(e: MouseEvent): void {
        const val = (e.currentTarget! as any).value;
        if (this._input) {
            this._input.value = val === "clear" ? "" : this._input!.value + val;
        }
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    private get _hasCode(): boolean {
        const entity_id = this._config?.entity;
        if (entity_id) {
            const entity = this.hass.states[entity_id];
            return hasCode(entity) && (this._config?.show_keypad ?? false);
        }
        return false;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;

        const entity = this.hass.states[entity_id];

        const name = this._config.name || entity.attributes.friendly_name;
        const icon = this._config.icon || stateIcon(entity);
        const color = getStateColor(entity.state);
        const shapePulse = shouldPulse(entity.state);
        const layout = getLayoutFromConfig(this._config);
        const hideState = this._config.hide_state;

        const actions: ActionButtonType[] =
            this._config.states && this._config.states.length > 0
                ? isDisarmed(entity)
                    ? this._config.states.map((state) => ({ state }))
                    : [{ state: "disarmed" }]
                : [];

        const isActionEnabled = isActionsAvailable(entity);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const iconStyle = {
            "--icon-color": `rgb(${color})`,
            "--shape-color": `rgba(${color}, 0.2)`,
        };

        const rtl = computeRTL(this.hass);

        return html`
            <ha-card>
                <mushroom-card .layout=${layout} no-card-style ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .layout=${layout}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        <mushroom-shape-icon
                            slot="icon"
                            style=${styleMap(iconStyle)}
                            class=${classMap({
                                pulse: shapePulse,
                            })}
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
                            .secondary=${!hideState && stateDisplay}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                    ${actions.length > 0
                        ? html`
                              <mushroom-button-group .fill="${layout !== "horizontal"}" ?rtl=${rtl}>
                                  ${actions.map(
                                      (action) => html`
                                          <mushroom-button
                                              .icon=${alarmPanelIconAction(action.state)}
                                              @click=${(e) => this._onTap(e, action.state)}
                                              .disabled=${!isActionEnabled}
                                          ></mushroom-button>
                                      `
                                  )}
                              </mushroom-button-group>
                          `
                        : null}
                </mushroom-card>
                ${!this._hasCode
                    ? html``
                    : html`
                          <mushroom-textfield
                              id="alarmCode"
                              .label=${this.hass.localize("ui.card.alarm_control_panel.code")}
                              type="password"
                              .inputmode=${entity.attributes.code_format === "number"
                                  ? "numeric"
                                  : "text"}
                          ></mushroom-textfield>
                      `}
                ${!(this._hasCode && entity.attributes.code_format === "number")
                    ? html``
                    : html`
                          <div id="keypad">
                              ${BUTTONS.map((value) =>
                                  value === ""
                                      ? html`<mwc-button disabled></mwc-button>`
                                      : html`
                                            <mwc-button
                                                .value=${value}
                                                @click=${this._handlePadClick}
                                                outlined
                                                class=${classMap({
                                                    numberkey: value !== "clear",
                                                })}
                                            >
                                                ${value === "clear"
                                                    ? this.hass!.localize(
                                                          `ui.card.alarm_control_panel.clear_code`
                                                      )
                                                    : value}
                                            </mwc-button>
                                        `
                              )}
                          </div>
                      `}
            </ha-card>
        `;
    }

    static get styles(): CSSResultGroup {
        // Default colors are RGB values of HASS --label-badge-*
        return [
            cardStyle,
            css`
                ha-card {
                    height: 100%;
                    box-sizing: border-box;
                    padding: var(--spacing);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                mushroom-state-item {
                    cursor: pointer;
                }
                .alert {
                    --main-color: var(--warning-color);
                }
                mushroom-shape-icon.pulse {
                    --shape-animation: 1s ease 0s infinite normal none running pulse;
                }
                mushroom-textfield {
                    display: block;
                    margin: 8px auto;
                    max-width: 150px;
                    text-align: center;
                }
                #keypad {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin: auto;
                    width: 100%;
                    max-width: 300px;
                }
                #keypad mwc-button {
                    padding: 8px;
                    width: 30%;
                    box-sizing: border-box;
                }
            `,
        ];
    }
}
