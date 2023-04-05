import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { fireEvent, LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { FAN_CARD_EDITOR_NAME, FAN_ENTITY_DOMAINS } from "./const";
import { FanCardConfig, fanCardConfigStruct } from "./fan-card-config";
import '../../shared/button'

const FAN_LABELS = ["icon_animation", "show_percentage_control", "show_oscillate_control"];

const mdiClose = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
const mdiPlus = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: FAN_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "icon", selector: { icon: { placeholder: icon } } },
            { name: "icon_animation", selector: { boolean: {} } },
        ],
    },
    ...APPEARANCE_FORM_SCHEMA,
    {
        type: "grid",
        name: "",
        schema: [
            { name: "show_percentage_control", selector: { boolean: {} } },
            { name: "show_oscillate_control", selector: { boolean: {} } },
            { name: "collapsible_controls", selector: { boolean: {} } },
        ],
    },
    ...computeActionsFormSchema(),
]);

const customPresetsScheme: HaFormSchema[] = [
    {
        type: "grid",
        name: "",
        schema: [
            { name: "icon", selector: { icon: { placeholder: 'mdi:fan' } } },
            { name: "value", selector: { number: {min: 0, max: 100, step: 1, mode: 'box'} } }
        ]
    }
];

@customElement(FAN_CARD_EDITOR_NAME)
export class FanCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: FanCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: FanCardConfig): void {
        assert(config, fanCardConfigStruct);
        this._config = config;
    }

    private _customLocalize = setupCustomlocalize(this.hass!);

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (FAN_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.fan.${schema.name}`);
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
        const schema = computeSchema(icon);

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>
            <div class="root">
                <h3>${this._customLocalize('editor.card.fan.custom_presets.title')}</h3>
                ${this._config.custom_presets?.map((preset, index) => {
                    return html`
                        <div class="custom-preset-row">
                            <ha-form
                                .hass=${this.hass}
                                .data=${preset}
                                .schema=${customPresetsScheme}
                                .computeLabel=${this._computeLabel}
                                @value-changed=${this._presetValueChanged}
                                .index=${index}
                            ></ha-form>
                            <ha-icon-button
                                .label=${this._customLocalize('editor.card.fan.custom_presets.remove')}
                                .path=${mdiClose}
                                class="remove-icon"
                                .index=${index}
                                @click=${this._removeRow}
                                >
                            </ha-icon-button>
                        </div>
                    `
                })}
                <ha-icon-button
                .label=${this._customLocalize('editor.card.fan.custom_presets.add')}
                .path=${mdiPlus}
                class="plus-icon"
                @click=${this._addRow}
            ></ha-icon-button>
            </div>
        `;
    }

    private _removeRow(ev: CustomEvent): void {
        const index = (ev.currentTarget as any).index;
        const newCustomPresets = this._config!.custom_presets!.concat();
    
        newCustomPresets.splice(index, 1);

        this._config!.custom_presets = newCustomPresets.length === 0 ? undefined : newCustomPresets;
    
        fireEvent(this, "config-changed", { config: this._config! });
      }

    private _addRow(): void {
        const newCustomPresets = (this._config!.custom_presets || []).concat();
    
        newCustomPresets.push({
            icon: 'mdi:fan',
            value: 100
        })

        this._config!.custom_presets = newCustomPresets;
    
        fireEvent(this, "config-changed", { config: this._config! });
      }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    private _presetValueChanged(ev: CustomEvent): void {
        const index = (ev.currentTarget as any).index;
        const newCustomPresets = this._config!.custom_presets!.concat();
        newCustomPresets[index] = {...ev.detail.value};
        this._config!.custom_presets = newCustomPresets;
    
        fireEvent(this, "config-changed", { config: this._config! });
    }

    static get styles(): CSSResultGroup {
        return [
            css`
                .remove-icon,
                .plus-icon {
                --mdc-icon-button-size: 36px;
                color: var(--secondary-text-color);
                }
                .custom-preset-row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .custom-preset-row ha-form {
                    flex: 1
                }
                .custom-preset-row ha-icon-button,
                .custom-preset-row button {
                    flex-shring: 1;
                    flex-basis: 0%;
                }
            `
        ]
    }
}
