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
 * TODO: add controls and customize controls
 * TODO: fix pulse on arming and triggering
 * TODO: customize icon from for modes (advanced YAML configuration)
 */

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

        let has_alert = false;
        panels.forEach(element => {
            has_alert = has_alert || this.hass.states[element].state !== panel_state.state;
        });

        const name = this._config.name ?? entity_state.attributes.friendly_name;
        const icon = ALARM_CONTROL_PANEL_CARD_STATE_ICON[panel_state.state] || "mdi:shield-lock-outline";
        let color = "var(--label-badge-yellow)";
        if (panel_state.state === "disarmed") {
            color = "var(--label-badge-green)";
        } else if (panel_state.state.startsWith("armed_")) {
            color = "var(--label-badge-blue)";
        } else if (panel_state.state == "triggered") {
            color = "var(--label-badge-red)";
        }

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            panel_state,
            this.hass.locale
        );

        return html`<ha-card @click=${this.clickHandler}>
            <mushroom-state-item class="${panel_state.state}"
                style=${styleMap({
            "--icon-main-color": color,
            "--icon-shape-color": "rgba(rgb(var(--label-badge-green)), 0.9)",
            "--badge-main-color": "var(--warning-color)"
        })}
                .icon=${icon}
                .name=${name}
                .value=${stateDisplay}
                .active=${true}
                .badge_icon=${has_alert ? "mdi:exclamation" : undefined}
            >
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        return css`
        mushroom-state-item.triggered mushroom-shape-icon, mushroom-state-item.arming mushroom-shape-icon {
                animation: 1s ease 0s infinite normal none running pulse; !important
            }
            ha-card {
                cursor: pointer;
                display: flex;
                flex-direction: column;
                padding: 12px;
            }
        `;
    }
}
