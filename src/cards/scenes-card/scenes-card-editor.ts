import { fireEvent, HASSDomEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { array, assert, assign, dynamic, literal, object, optional, string } from "superstruct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { loadHaComponents } from "../../utils/loader";
import { EditorTarget, EditSubElementEvent, SubElementEditorConfig } from "../../utils/lovelace/editor/types";
import { SCENES_CARD_EDITOR_NAME } from "./const";
import { ItemConfig } from "./scene-editor-config";
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

    @state() private _subElementEditorConfig?: SubElementEditorConfig;

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

        if (this._subElementEditorConfig) {
            return html`
                <mushroom-scene-card-sub-element-editor
                    .hass=${this.hass}
                    .config=${this._subElementEditorConfig}
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
        const configValue = target.configValue || this._subElementEditorConfig?.type;
        const value = target.checked ?? ev.detail.value ?? target.value;

        if (configValue === "scene" || (ev.detail && ev.detail.items)) {
            const newConfigScenes = ev.detail.items || this._config!.items.concat();
            if (configValue === "scene") {
                if (!value) {
                    newConfigScenes.splice(this._subElementEditorConfig!.index!, 1);
                    this._goBack();
                } else {
                    newConfigScenes[this._subElementEditorConfig!.index!] = value;
                }

                this._subElementEditorConfig!.elementConfig = value;
            }

            this._config = { ...this._config!, items: newConfigScenes };
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

        if (configValue === "scene") {
            const newConfig = this._config!.items!.concat();
            if (!value) {
                newConfig.splice(this._subElementEditorConfig!.index!, 1);
                this._goBack();
            } else {
                newConfig[this._subElementEditorConfig!.index!] = value;
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
