import { fireEvent, HASSDomEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
    any,
    array,
    assert,
    assign,
    boolean,
    dynamic,
    literal,
    object,
    optional,
    string,
} from "superstruct";
import setupCustomlocalize from "../../localize";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { LovelaceChipConfig } from "../../utils/lovelace/chip/types";
import {
    EditorTarget,
    EditSubElementEvent,
    SubElementEditorConfig,
} from "../../utils/lovelace/editor/types";
import { ChipsCardConfig } from "./chips-card";
import "./chips-card-chips-editor";
import { CHIPS_CARD_EDITOR_NAME } from "./const";
import "../../utils/lovelace/sub-element-editor";

const actionChipConfigStruct = object({
    type: literal("action"),
    icon: optional(string()),
    icon_color: optional(string()),
    tap_action: optional(actionConfigStruct),
    hold_action: optional(actionConfigStruct),
    double_tap_action: optional(actionConfigStruct),
});

const backChipConfigStruct = object({
    type: literal("back"),
    icon: optional(string()),
    icon_color: optional(string()),
});

const entityChipConfigStruct = object({
    type: literal("entity"),
    entity: optional(string()),
    name: optional(string()),
    content_info: optional(string()),
    icon: optional(string()),
    icon_color: optional(string()),
    tap_action: optional(actionConfigStruct),
    hold_action: optional(actionConfigStruct),
    double_tap_action: optional(actionConfigStruct),
});

const menuChipConfigStruct = object({
    type: literal("menu"),
    icon: optional(string()),
    icon_color: optional(string()),
});

const weatherChipConfigStruct = object({
    type: literal("weather"),
    entity: optional(string()),
    tap_action: optional(actionConfigStruct),
    hold_action: optional(actionConfigStruct),
    double_tap_action: optional(actionConfigStruct),
    show_temperature: optional(boolean()),
    show_conditions: optional(boolean()),
});

const conditionStruct = object({
    entity: string(),
    state: optional(string()),
    state_not: optional(string()),
});

const conditionChipConfigStruct = object({
    type: literal("conditional"),
    chip: optional(any()),
    conditions: optional(array(conditionStruct)),
});

const chipsConfigStruct = dynamic<any>((value) => {
    if (value && typeof value === "object" && "type" in value) {
        switch ((value as LovelaceChipConfig).type!) {
            case "action": {
                return actionChipConfigStruct;
            }
            case "back": {
                return backChipConfigStruct;
            }
            case "entity": {
                return entityChipConfigStruct;
            }
            case "menu": {
                return menuChipConfigStruct;
            }
            case "weather": {
                return weatherChipConfigStruct;
            }
            case "conditional": {
                return conditionChipConfigStruct;
            }
        }
    }
    return object();
});

const cardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        chips: array(chipsConfigStruct),
        alignment: optional(string()),
    })
);

@customElement(CHIPS_CARD_EDITOR_NAME)
export class ChipsCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: ChipsCardConfig;

    @state() private _subElementEditorConfig?: SubElementEditorConfig;

    public setConfig(config: ChipsCardConfig): void {
        assert(config, cardConfigStruct);
        this._config = config;
    }

    get _title(): string {
        return this._config!.title || "";
    }

    get _theme(): string {
        return this._config!.theme || "";
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        if (this._subElementEditorConfig) {
            return html`
                <mushroom-sub-element-editor
                    .hass=${this.hass}
                    .config=${this._subElementEditorConfig}
                    @go-back=${this._goBack}
                    @config-changed=${this._handleSubElementChanged}
                >
                </mushroom-sub-element-editor>
            `;
        }

        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <div class="card-config">
                <paper-dropdown-menu .label="${customLocalize("editor.card.chips.alignment")} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})" >
                    <paper-listbox
                        slot="dropdown-content"
                        attr-for-selected="value"
                        .selected=${this._config.alignment ?? ""}
                        .configValue=${"alignment"}
                        @iron-select=${this._valueChanged}
                    >
                        <paper-item value="">
                            ${customLocalize("editor.card.chips.alignment_values.default")}
                        </paper-item>
                        ${["line-end", "center", "justify"].map(a => html`<paper-item .value=${a}>
                            ${customLocalize(`editor.card.chips.alignment_values.${a}`)}
                        </paper-item>`)}
                    </paper-listbox>
                </paper-dropdown-menu>
            </div>
            <mushroom-chips-card-chips-editor
                .hass=${this.hass}
                .chips=${this._config!.chips}
                @chips-changed=${this._valueChanged}
                @edit-detail-element=${this._editDetailElement}
            ></mushroom-chips-card-chips-editor>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        const configValue = target.configValue || this._subElementEditorConfig?.type;
        const value =
            target.checked !== undefined
                ? target.checked
                : target.value ?? ev.detail.value ?? ev.detail.item?.value;

        if (configValue === "chip" || (ev.detail && ev.detail.chips)) {
            const newConfigChips = ev.detail.chips || this._config!.chips.concat();
            if (configValue === "chip") {
                if (!value) {
                    newConfigChips.splice(this._subElementEditorConfig!.index!, 1);
                    this._goBack();
                } else {
                    newConfigChips[this._subElementEditorConfig!.index!] = value;
                }

                this._subElementEditorConfig!.elementConfig = value;
            }

            this._config = { ...this._config!, chips: newConfigChips };
        } else if (configValue) {
            if (!value) {
                this._config = { ...this._config };
                delete this._config[configValue!];
            } else {
                this._config = {
                    ...this._config,
                    [configValue!]: value,
                };
            }
        }

        fireEvent(this, "config-changed", { config: this._config });
    }

    private _handleSubElementChanged(ev: CustomEvent): void {
        ev.stopPropagation();
        if (!this._config || !this.hass) {
            return;
        }

        const configValue = this._subElementEditorConfig?.type;
        const value = ev.detail.config;

        if (configValue === "chip") {
            const newConfigChips = this._config!.chips!.concat();
            if (!value) {
                newConfigChips.splice(this._subElementEditorConfig!.index!, 1);
                this._goBack();
            } else {
                newConfigChips[this._subElementEditorConfig!.index!] = value;
            }

            this._config = { ...this._config!, chips: newConfigChips };
        } else if (configValue) {
            if (value === "") {
                this._config = { ...this._config };
                delete this._config[configValue!];
            } else {
                this._config = {
                    ...this._config,
                    [configValue]: value,
                };
            }
        }

        this._subElementEditorConfig = {
            ...this._subElementEditorConfig!,
            elementConfig: value,
        };

        fireEvent(this, "config-changed", { config: this._config });
    }

    private _editDetailElement(ev: HASSDomEvent<EditSubElementEvent>): void {
        this._subElementEditorConfig = ev.detail.subElementConfig;
    }

    private _goBack(): void {
        this._subElementEditorConfig = undefined;
    }
}
