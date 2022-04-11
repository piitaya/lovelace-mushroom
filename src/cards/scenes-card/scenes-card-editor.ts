import { fireEvent, HASSDomEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { array, assert, assign, dynamic, literal, object, optional, string } from "superstruct";
import setupCustomlocalize from "../../localize";
import "../../shared/editor/alignment-picker";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { loadHaComponents } from "../../utils/loader";
import { LovelaceSceneConfig } from "../../utils/lovelace/scene/types";
import {
    EditorTarget,
    EditSubElementEvent,
    SubElementEditorConfig,
} from "../../utils/lovelace/editor/types";
import "../../utils/lovelace/sub-element-editor";
import { ScenesCardConfig } from "./scenes-card";
import "./scenes-card-scenes-editor";
import { SCENES_CARD_EDITOR_NAME } from "./const";

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
        switch ((value as LovelaceSceneConfig).type!) {
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
        alignment: optional(string()),
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
                <mushroom-alignment-picker
                    .label="${customLocalize("editor.card.scenes.alignment")} (${this.hass.localize(
                        "ui.panel.lovelace.editor.card.config.optional"
                    )})"
                    .hass=${this.hass}
                    .value=${this._config.alignment}
                    .configValue=${"alignment"}
                    @value-changed=${this._valueChanged}
                >
                </mushroom-alignment-picker>
            </div>
            <mushroom-scenes-card-scenes-editor
                .hass=${this.hass}
                .scenes=${this._config!.items}
                @scenes-changed=${this._valueChanged}
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
            const newConfigScenes = this._config!.items!.concat();
            if (!value) {
                newConfigScenes.splice(this._subElementEditorConfig!.index!, 1);
                this._goBack();
            } else {
                newConfigScenes[this._subElementEditorConfig!.index!] = value;
            }

            this._config = { ...this._config!, items: newConfigScenes };
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
