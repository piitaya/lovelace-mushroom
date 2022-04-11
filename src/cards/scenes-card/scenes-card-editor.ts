import { fireEvent, HASSDomEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { array, assert, assign, dynamic, literal, object, optional, string } from "superstruct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { loadHaComponents } from "../../utils/loader";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { SCENES_CARD_EDITOR_NAME } from "./const";
import { EditSubItemEditorConfig, ItemConfig, SubItemEditorConfig } from "./scene-editor-config";
import { ScenesCardConfig } from "./scenes-card";
import "./scenes-card-scenes-editor";
import "./editor/item-element-editor";

const sceneConfigStruct = object({
    type: literal("scene"),
    entity: optional(string()),
    name: optional(string()),
    icon: optional(string()),
    icon_color: optional(string()),
    background_color: optional(string()),
});

const scriptConfigStruct = object({
    type: literal("script"),
    entity: optional(string()),
    name: optional(string()),
    icon: optional(string()),
    icon_color: optional(string()),
    background_color: optional(string()),
});

const scenesConfigStruct = dynamic<any>((value) => {
    if (value && typeof value === "object" && "type" in value) {
        switch ((value as ItemConfig).type!) {
            case "scene":
                return sceneConfigStruct;
            case "script":
                return scriptConfigStruct;
        }
    }
    return object();
});

const cardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        items: array(scenesConfigStruct),
    })
);

@customElement(SCENES_CARD_EDITOR_NAME)
export class ScenesCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: ScenesCardConfig;

    @state() private _subItemEditorConfig?: SubItemEditorConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: ScenesCardConfig): void {
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

        if (this._subItemEditorConfig) {
            return html`
                <mushroom-scene-card-sub-element-editor
                    .hass=${this.hass}
                    .config=${this._subItemEditorConfig}
                    @go-back=${this._goBack}
                    @config-changed=${this._handleSubElementChanged}
                >
                </mushroom-scene-card-sub-element-editor>
            `;
        }

        return html`
            <mushroom-scenes-card-scenes-editor
                .hass=${this.hass}
                .items=${this._config!.items}
                @items-changed=${this._valueChanged}
                @edit-detail-element=${this._editDetailElement}
            ></mushroom-scenes-card-scenes-editor>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        const configValue = target.configValue || this._subItemEditorConfig?.type;
        const value = target.checked ?? ev.detail.value ?? target.value;

        if (configValue === "item" || (ev.detail && ev.detail.items)) {
            const newConfigItems = ev.detail.items || this._config!.items.concat();
            if (configValue === "item") {
                if (!value) {
                    newConfigItems.splice(this._subItemEditorConfig!.index!, 1);
                    this._goBack();
                } else {
                    newConfigItems[this._subItemEditorConfig!.index!] = value;
                }

                this._subItemEditorConfig!.elementConfig = value;
            }

            this._config = { ...this._config!, items: newConfigItems };
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

        const configValue = this._subItemEditorConfig?.type;
        const value = ev.detail.config;

        if (configValue === "item") {
            const newConfig = this._config!.items!.concat();
            if (!value) {
                newConfig.splice(this._subItemEditorConfig!.index!, 1);
                this._goBack();
            } else {
                newConfig[this._subItemEditorConfig!.index!] = value;
            }

            this._config = { ...this._config!, items: newConfig };
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

        this._subItemEditorConfig = {
            ...this._subItemEditorConfig!,
            elementConfig: value,
        };

        fireEvent(this, "config-changed", { config: this._config });
    }

    private _editDetailElement(ev: HASSDomEvent<EditSubItemEditorConfig>): void {
        this._subItemEditorConfig = ev.detail.subElementConfig;
    }

    private _goBack(): void {
        this._subItemEditorConfig = undefined;
    }
}
