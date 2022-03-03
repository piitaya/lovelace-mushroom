import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import "../../shared/editor/color-picker";
import "../../shared/editor/info-picker";
import "../../shared/editor/layout-picker";
import "../../shared/form/mushroom-textfield";
import { configElementStyle } from "../../utils/editor-styles";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { ENTITY_CARD_EDITOR_NAME } from "./const";
import { EntityCardConfig, entityCardConfigStruct } from "./entity-card-config";

const actions = ["toggle", "more-info", "navigate", "url", "call-service", "none"];

const GENERIC_FIELDS = [
    "hide_name",
    "hide_state",
    "hide_icon",
    "icon_color",
    "layout",
    "primary_info",
    "secondary_info",
];

@customElement(ENTITY_CARD_EDITOR_NAME)
export class EntityCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: EntityCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: EntityCardConfig): void {
        assert(config, entityCardConfigStruct);
        this._config = config;
    }

    private _schema = memoizeOne((icon?: string): HaFormSchema[] => [
        { name: "entity", selector: { entity: {} } },
        { name: "name", selector: { text: {} } },
        {
            type: "grid",
            name: "",
            schema: [
                { name: "icon", selector: { icon: { placeholder: icon } } },
                { name: "icon_color", selector: { "mush-color": {} } },
            ],
        },
        {
            type: "grid",
            name: "",
            schema: [
                { name: "layout", selector: { "mush-layout": {} } },
                { name: "hide_icon", selector: { boolean: {} } },
            ],
        },
        {
            type: "grid",
            name: "",
            schema: [
                { name: "primary_info", selector: { "mush-info": {} } },
                { name: "secondary_info", selector: { "mush-info": {} } },
            ],
        },
    ]);

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entityState = this._config.entity ? this.hass.states[this._config.entity] : undefined;
        const entityIcon = entityState ? stateIcon(entityState) : undefined;

        const icon = this._config.icon || entityIcon;
        const schema = this._schema(icon);

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
            ></ha-form>
            <div class="card-config">
                <div class="side-by-side">
                    <hui-action-editor
                        .label=${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.tap_action"
                        )}
                        .hass=${this.hass}
                        .config=${this._config.tap_action}
                        .actions=${actions}
                        .configValue=${"tap_action"}
                        @value-changed=${this._actionChanged}
                    ></hui-action-editor>
                    <hui-action-editor
                        .label=${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.hold_action"
                        )}
                        .hass=${this.hass}
                        .config=${this._config.hold_action}
                        .actions=${actions}
                        .configValue=${"hold_action"}
                        @value-changed=${this._actionChanged}
                    ></hui-action-editor>
                </div>
            </div>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    private _actionChanged(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        const value = ev.detail.value;

        if (target.configValue && this._config[target.configValue] === value) {
            return;
        }
        if (target.configValue) {
            if (value !== false && !value) {
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
