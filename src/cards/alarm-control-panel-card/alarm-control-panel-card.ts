import {
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/state-item";
import { registerCustomCard } from "../../utils/custom-cards";
import { ALARM_CONTROl_PANEL_CARD_EDITOR_NAME, ALARM_CONTROl_PANEL_CARD_NAME, ALARM_CONTROL_PANEL_CARD_STATE_ICON } from "./const";
import "./alarm-control-panel-card-editor";
import { styleMap } from "lit/directives/style-map.js";

export interface AlarmControlPanelCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    name?: string;
}

registerCustomCard({
    type: ALARM_CONTROl_PANEL_CARD_NAME,
    name: "Mushroom Alarm Control Panel Card",
    description: "Card for alarm control panel",
});

/*
 * TODO: customize controls
 * TODO: customize icon for modes (advanced YAML configuration)
 * TODO: handle text code
 * TODO: handle number code
 */

type ActionButtonType = {
    icon: string,
    action: string,
    disabled?: boolean
};

@customElement(ALARM_CONTROl_PANEL_CARD_NAME)
export class AlarmControlPanelCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            ALARM_CONTROl_PANEL_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<AlarmControlPanelCardConfig> {
        const entities = Object.keys(hass.states);
        const panels = entities.filter((e) => {
            if (e.startsWith("group.")) {
                let first_group_entity = hass.states[e].attributes.entity_id[0];
                return first_group_entity.startsWith("alarm_control_panel.");
            }
            return e.startsWith("alarm_control_panel.");
        });
        return {
            type: `custom:${ALARM_CONTROl_PANEL_CARD_NAME}`,
            entity: panels[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: AlarmControlPanelCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: AlarmControlPanelCardConfig): void {
        this._config = {
            tap_action: {
                action: "more-info",
            },
            ...config,
        };
    }


    private _onTap(e: MouseEvent, service: string): void {
        e.stopPropagation();
        this.hass.callService("alarm_control_panel", service, {
            entity_id: this._config?.entity,
        });
    }

    clickHandler(ev: ActionHandlerEvent): void {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    private get _isGroup() {
        return !!(this._config?.entity.startsWith("group."));
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const entity = this._config.entity;
        const panels = this._isGroup ? this.hass.states[entity].attributes.entity_id : [entity]
        const [ref_panel] = panels;

        const entity_state = this.hass.states[entity];
        const panel_state = this.hass.states[ref_panel]

        let has_alert = panel_state.state.startsWith("partially_");
        panels.forEach(element => {
            has_alert = has_alert || this.hass.states[element].state !== panel_state.state;
        });

        const name = this._config.name ?? entity_state.attributes.friendly_name;
        const icon = ALARM_CONTROL_PANEL_CARD_STATE_ICON[panel_state.state] || "mdi:shield-lock-outline";
        let state_color = {
            disarmed: "var(--rgb-alarm-state-color-disarmed)",
            armed: "var(--rgb-alarm-state-color-armed)",
            triggered: "var(--rgb-alarm-state-color-triggered)",
            unavailable: "var(--rgb-alarm-state-color-warning)"
        };
        const color = state_color[panel_state.state.split("_")[0]] || "var(--rgb-alarm-state-color-default)";
        const shape_pulse = ["arming", "triggered", "pending", "unavailable"].indexOf(panel_state.state) >= 0;
        let buttons: ActionButtonType[] = [{ icon: ALARM_CONTROL_PANEL_CARD_STATE_ICON.disarmed, action: "alarm_disarm" }];
        if (panel_state.state === "disarmed") {
            buttons = [
                { icon: ALARM_CONTROL_PANEL_CARD_STATE_ICON.armed_away, action: "alarm_arm_away" },
                { icon: ALARM_CONTROL_PANEL_CARD_STATE_ICON.armed_home, action: "alarm_arm_home" },
                { icon: ALARM_CONTROL_PANEL_CARD_STATE_ICON.armed_night, action: "alarm_arm_night" },
                { icon: ALARM_CONTROL_PANEL_CARD_STATE_ICON.armed_vacation, action: "alarm_arm_vacation" },
            ]
        }
        if (["pending", "unavailable"].indexOf(panel_state.state) >= 0) {
            buttons.forEach(b => {
                b.disabled = true;
            })
        }


        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            panel_state,
            this.hass.locale
        );

        return html`<ha-card @click=${this.clickHandler}>
            <mushroom-state-item class="${panel_state.state}"
                style=${styleMap({
            "--icon-main-color": `rgb(${color})`,
            "--icon-shape-color": `rgba(${color}, 0.2)`,
            "--badge-main-color": "var(--warning-color)"
        })}
                        .icon=${icon}
                        .name=${name}
                        .value=${stateDisplay}
                        .active=${true}
                        .shape_pulse=${shape_pulse}
                        .badge_icon=${has_alert ? "mdi:exclamation" : undefined}
                    ></mushroom-state-item>
                <div class="actions">
                    ${buttons.map(b => html`<mushroom-button
                        icon=${b.icon}
                        @click=${(e) => this._onTap(e, b.action)}
                        .disabled=${!!b.disabled}
                    ></mushroom-button>`)}
                </div>
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        // Defalt colors are RGB values of HASS --label-badge-*
        return css`
            :host {
                --rgb-alarm-state-color-default: var(--rgb-primary-text-color);
                --rgb-alarm-state-color-warning: 240,180,0;
                --rgb-alarm-state-color-disarmed: 3,155,229;
                --rgb-alarm-state-color-armed: 13,160,53;
                --rgb-alarm-state-color-triggered: 223,76,30;
            }
            ha-card {
                cursor: pointer;
                display: flex;
                flex-direction: column;
                padding: 12px;
            }
            ha-card > *:not(:last-child) {
                margin-bottom: 12px;
            }
            .actions {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
            }
            .actions *:not(:last-child) {
                margin-right: 12px;
            }
            .actions mushroom-button {
                flex: 1;
            }
        `;
    }
}
