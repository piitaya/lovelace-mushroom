import {
    fireEvent,
    HomeAssistant,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert, assign, object, optional, string } from "superstruct";
import {
    baseLovelaceCardConfig,
    configElementStyle,
    EditorTarget,
} from "../../utils/editor";
import { ALARM_CONTROl_PANEL_GROUP_CARD_EDITOR_NAME } from "./const";
import { AlarmControlPanelGroupCardConfig } from "./alarm-control-panel-group-card";

const DOMAINS = ["group"];

const cardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: string(),
        name: optional(string()),
    })
);

@customElement(ALARM_CONTROl_PANEL_GROUP_CARD_EDITOR_NAME)
export class SwitchCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: AlarmControlPanelGroupCardConfig;

    public setConfig(config: AlarmControlPanelGroupCardConfig): void {
        assert(config, cardConfigStruct);
        this._config = config;
    }

    get _entity(): string {
        return this._config!.entity || "";
    }

    get _name(): string {
        return this._config!.name || "";
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entityState = this.hass.states[this._entity];

        return html`
            <div class="card-config">
                <ha-entity-picker
                    .label="${this.hass.localize(
            "ui.panel.lovelace.editor.card.generic.entity"
        )}"
                    .hass=${this.hass}
                    .value=${this._entity}
                    .configValue=${"entity"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${DOMAINS}
                    allow-custom-entity
                ></ha-entity-picker>
                <div class="side-by-side">
                    <paper-input
                        .label="${this.hass.localize(
            "ui.panel.lovelace.editor.card.generic.name"
        )} (${this.hass.localize(
            "ui.panel.lovelace.editor.card.config.optional"
        )})"
                        .value=${this._name}
                        .configValue=${"name"}
                        @value-changed=${this._valueChanged}
                    ></paper-input>
                </div>
            </div>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        const value =
            target.checked !== undefined ? target.checked : ev.detail.value;

        if (this[`_${target.configValue}`] === value) {
            return;
        }

        let newConfig;
        if (target.configValue) {
            if (!value) {
                newConfig = { ...this._config };
                delete newConfig[target.configValue!];
            } else {
                newConfig = {
                    ...this._config,
                    [target.configValue!]: value,
                };
            }
        }
        fireEvent(this, "config-changed", { config: newConfig });
    }

    static get styles(): CSSResultGroup {
        return configElementStyle;
    }
}
