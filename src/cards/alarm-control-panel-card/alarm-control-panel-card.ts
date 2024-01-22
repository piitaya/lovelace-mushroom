import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, nothing, PropertyValues, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/button-group";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { alarmPanelIconAction } from "../../utils/icons/alarm-panel-icon";
import { computeEntityPicture } from "../../utils/info";
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
export class AlarmControlPanelCard extends MushroomBaseCard implements LovelaceCard {
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
        const entityId = this._config.entity;
        const stateObj = this.hass.states[entityId] as HassEntity | undefined;

        if (stateObj && hasCode(stateObj)) {
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
        const entityId = this._config?.entity;
        if (!entityId) return false;
        const stateObj = this.hass.states[entityId] as HassEntity | undefined;
        if (!stateObj) return false;
        return hasCode(stateObj) && Boolean(this._config?.show_keypad);
    }

    protected render() {
        if (!this.hass || !this._config || !this._config.entity) {
            return nothing;
        }

        const entityId = this._config.entity;
        const stateObj = this.hass.states[entityId] as HassEntity | undefined;

        if (!stateObj) {
            return this.renderNotFound(this._config);
        }

        const name = this._config.name || stateObj.attributes.friendly_name || "";
        const icon = this._config.icon;
        const appearance = computeAppearance(this._config);
        const picture = computeEntityPicture(stateObj, appearance.icon_type);

        const actions: ActionButtonType[] =
            this._config.states && this._config.states.length > 0
                ? isDisarmed(stateObj)
                    ? this._config.states.map((state) => ({ state }))
                    : [{ state: "disarmed" }]
                : [];

        const isActionEnabled = isActionsAvailable(stateObj);

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
                        ${picture ? this.renderPicture(picture) : this.renderIcon(stateObj, icon)}
                        ${this.renderBadge(stateObj)}
                        ${this.renderStateInfo(stateObj, appearance, name)};
                    </mushroom-state-item>
                    ${actions.length > 0
                        ? html`
                              <mushroom-button-group
                                  .fill="${appearance.layout !== "horizontal"}"
                                  ?rtl=${rtl}
                              >
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
                        : nothing}
                </mushroom-card>
                ${!this._hasCode
                    ? nothing
                    : html`
                          <mushroom-textfield
                              id="alarmCode"
                              .label=${this.hass.localize("ui.card.alarm_control_panel.code")}
                              type="password"
                              .inputmode=${stateObj.attributes.code_format === "number"
                                  ? "numeric"
                                  : "text"}
                          ></mushroom-textfield>
                      `}
                ${!(this._hasCode && stateObj.attributes.code_format === "number")
                    ? nothing
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

    protected renderIcon(stateObj: HassEntity, icon?: string): TemplateResult {
        const color = getStateColor(stateObj.state);
        const shapePulse = shouldPulse(stateObj.state);
        const iconStyle = {
            "--icon-color": `rgb(${color})`,
            "--shape-color": `rgba(${color}, 0.2)`,
        };
        return html`
            <mushroom-shape-icon
                slot="icon"
                style=${styleMap(iconStyle)}
                class=${classMap({ pulse: shapePulse })}
            >
                <ha-state-icon
                    .hass=${this.hass}
                    .stateObj=${stateObj}
                    .state=${stateObj}
                    .icon=${icon}
                ></ha-state-icon>
            </mushroom-shape-icon>
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
