import {
    computeRTLDirection,
    fireEvent,
    HomeAssistant,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { COLORS, computeColorName, computeRgbColor } from "../../utils/colors";
import { configElementStyle } from "../../utils/editor-styles";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { ENTITY_CARD_EDITOR_NAME } from "./const";
import {
    EntityCardConfig,
    entityCardConfigStruct,
    INFOS,
} from "./entity-card-config";

const actions = [
    "toggle",
    "more-info",
    "navigate",
    "url",
    "call-service",
    "none",
];

@customElement(ENTITY_CARD_EDITOR_NAME)
export class EntityCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: EntityCardConfig;

    public setConfig(config: EntityCardConfig): void {
        assert(config, entityCardConfigStruct);
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const dir = computeRTLDirection(this.hass);
        const entityState = this._config.entity
            ? this.hass.states[this._config.entity]
            : undefined;
        const entityIcon = entityState ? stateIcon(entityState) : undefined;

        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <div class="card-config">
                <ha-entity-picker
                    .label="${this.hass.localize(
                        "ui.panel.lovelace.editor.card.generic.entity"
                    )}"
                    .hass=${this.hass}
                    .value=${this._config.entity}
                    .configValue=${"entity"}
                    @value-changed=${this._valueChanged}
                    allow-custom-entity
                ></ha-entity-picker>
                <div class="side-by-side">
                    <paper-input
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.name"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .value=${this._config.name}
                        .configValue=${"name"}
                        @value-changed=${this._valueChanged}
                    ></paper-input>
                    <ha-icon-picker
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.icon"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .value=${this._config.icon}
                        .placeholder=${this._config.icon || entityIcon}
                        .configValue=${"icon"}
                        @value-changed=${this._valueChanged}
                    ></ha-icon-picker>
                </div>
                <div class="side-by-side">
                    <paper-dropdown-menu
                        .label="${customLocalize(
                            "editor.card.generic.icon_color"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                    >
                        <paper-listbox
                            slot="dropdown-content"
                            attr-for-selected="value"
                            .selected=${this._config.icon_color ?? ""}
                            .configValue=${"icon_color"}
                            @iron-select=${this._valueChanged}
                        >
                            <paper-item value=""
                                >${customLocalize(
                                    "editor.card.generic.color_values.default"
                                )}</paper-item
                            >
                            ${COLORS.map(
                                (color) => html`
                                    <paper-item .value=${color}>
                                        ${this.renderColorCircle(color)}
                                        ${computeColorName(color)}
                                    </paper-item>
                                `
                            )}
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <ha-formfield
                        .label=${customLocalize("editor.card.generic.vertical")}
                        .dir=${dir}
                    >
                        <ha-switch
                            .checked=${!!this._config.vertical}
                            .configValue=${"vertical"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                </div>
                <div class="side-by-side">
                    <paper-dropdown-menu
                        .label=${customLocalize(
                            "editor.card.entity.primary_info"
                        )}
                    >
                        <paper-listbox
                            slot="dropdown-content"
                            attr-for-selected="value"
                            .selected=${this._config.primary_info ?? ""}
                            .configValue=${"primary_info"}
                            @iron-select=${this._valueChanged}
                        >
                            <paper-item value="">
                                ${customLocalize(
                                    "editor.card.entity.info_values.default"
                                )}
                            </paper-item>
                            ${INFOS.map((info) => {
                                return html`
                                    <paper-item .value=${info}>
                                        ${customLocalize(
                                            `editor.card.entity.info_values.${info}`
                                        )}
                                    </paper-item>
                                `;
                            })}
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-dropdown-menu
                        .label=${customLocalize(
                            "editor.card.entity.secondary_info"
                        )}
                    >
                        <paper-listbox
                            slot="dropdown-content"
                            attr-for-selected="value"
                            .selected=${this._config.secondary_info ?? ""}
                            .configValue=${"secondary_info"}
                            @iron-select=${this._valueChanged}
                        >
                            <paper-item value="">
                                ${customLocalize(
                                    "editor.card.entity.info_values.default"
                                )}
                            </paper-item>
                            ${INFOS.map((info) => {
                                return html`
                                    <paper-item .value=${info}>
                                        ${customLocalize(
                                            `editor.card.entity.info_values.${info}`
                                        )}
                                    </paper-item>
                                `;
                            })}
                        </paper-listbox>
                    </paper-dropdown-menu>
                </div>
                <div class="side-by-side">
                    <hui-action-editor
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.tap_action"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .hass=${this.hass}
                        .config=${this._config.tap_action}
                        .actions=${actions}
                        .configValue=${"tap_action"}
                        .tooltipText=${this.hass.localize(
                            "ui.panel.lovelace.editor.card.button.default_action_help"
                        )}
                        @value-changed=${this._valueChanged}
                    ></hui-action-editor>
                    <hui-action-editor
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.hold_action"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .hass=${this.hass}
                        .config=${this._config.hold_action}
                        .actions=${actions}
                        .configValue=${"hold_action"}
                        .tooltipText=${this.hass.localize(
                            "ui.panel.lovelace.editor.card.button.default_action_help"
                        )}
                        @value-changed=${this._valueChanged}
                    ></hui-action-editor>
                </div>
            </div>
        `;
    }

    private renderColorCircle(color: string) {
        return html` <span
            class="circle-color"
            style=${styleMap({
                "--main-color": computeRgbColor(color),
            })}
        ></span>`;
    }

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        const value =
            target.checked ?? ev.detail.value ?? ev.detail.item?.value;

        if (!target.configValue || this._config[target.configValue] === value) {
            return;
        }
        if (target.configValue) {
            if (!value) {
                this._config = { ...this._config };
                delete this._config[target.configValue!];
            } else {
                this._config = {
                    ...this._config,
                    [target.configValue!]: value,
                };
            }
        }
        fireEvent(this, "config-changed", { config: this._config });
    }

    static get styles(): CSSResultGroup {
        return configElementStyle;
    }
}
