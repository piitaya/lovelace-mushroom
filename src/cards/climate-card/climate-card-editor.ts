import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { atLeastHaVersion, fireEvent, LocalizeFunc, LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { CLIMATE_CARD_EDITOR_NAME, CLIMATE_ENTITY_DOMAINS } from "./const";
import { ClimateCardConfig, climateCardConfigStruct, HVAC_MODES } from "./climate-card-config";

const CLIMATE_LABELS = ["hvac_modes", "show_temperature_control"] as string[];

const computeSchema = memoizeOne(
    (localize: LocalizeFunc, haVersion: string, icon?: string): HaFormSchema[] => [
        { name: "entity", selector: { entity: { domain: CLIMATE_ENTITY_DOMAINS } } },
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: { placeholder: icon } } },
        ...APPEARANCE_FORM_SCHEMA,
        {
            type: "grid",
            name: "",
            schema: [
                {
                    name: "hvac_modes",
                    selector: {
                        select: {
                            options: HVAC_MODES.map((mode) => ({
                                value: mode,
                                label: localize(
                                    atLeastHaVersion(haVersion, 2023, 4)
                                        ? `component.climate.entity_component._.state.${mode}`
                                        : `component.climate.state._.${mode}`
                                ),
                            })),
                            mode: "dropdown",
                            multiple: true,
                        },
                    },
                },
                { name: "show_temperature_control", selector: { boolean: {} } },
                { name: "collapsible_controls", selector: { boolean: {} } },
            ],
        },
        ...computeActionsFormSchema(),
    ]
);

@customElement(CLIMATE_CARD_EDITOR_NAME)
export class ClimateCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: ClimateCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: ClimateCardConfig): void {
        assert(config, climateCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (CLIMATE_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.climate.${schema.name}`);
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
        const schema = computeSchema(this.hass!.localize, this.hass!.connection.haVersion, icon);

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }
}
