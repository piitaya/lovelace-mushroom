import { fireEvent, HASSDomEvent, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import setupCustomlocalize from "../../../localize";
import { GUIModeChangedEvent, SubElementEditorConfig } from "../../../utils/lovelace/editor/types";
import { MushroomElementEditor } from "../../../utils/lovelace/element-editor";
import { SceneCardConfig } from "../scene-editor-config";
import "./scene-element-editor";

declare global {
    interface HASSDomEvents {
        "go-back": undefined;
    }
}

@customElement("mushroom-scene-card-sub-element-editor")
export class MushroomSceneCardSubElementEditor extends LitElement {
    public hass!: HomeAssistant;

    @property({ attribute: false }) public config!: SubElementEditorConfig;

    @state() private _guiModeAvailable = true;

    @state() private _guiMode = true;

    @query(".editor")
    private _editorElement?: MushroomElementEditor<SceneCardConfig>;

    protected render(): TemplateResult {
        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <div class="header">
                <div class="back-title">
                    <ha-icon-button
                        .label=${this.hass!.localize("ui.common.back")}
                        @click=${this._goBack}
                    >
                        <ha-icon icon="mdi:arrow-left"></ha-icon>
                    </ha-icon-button>
                    <span slot="title"
                        >${customLocalize(`editor.chip.sub_element_editor.title`)}</span
                    >
                </div>
                <mwc-button
                    slot="secondaryAction"
                    .disabled=${!this._guiModeAvailable}
                    @click=${this._toggleMode}
                >
                    ${this.hass.localize(
                        this._guiMode
                            ? "ui.panel.lovelace.editor.edit_card.show_code_editor"
                            : "ui.panel.lovelace.editor.edit_card.show_visual_editor"
                    )}
                </mwc-button>
            </div>
            ${this.config.type === "scene"
                ? html`
                      <mushroom-scene-element-editor
                          class="editor"
                          .hass=${this.hass}
                          .value=${this.config.elementConfig}
                          @config-changed=${this._handleConfigChanged}
                          @GUImode-changed=${this._handleGUIModeChanged}
                      ></mushroom-scene-element-editor>
                  `
                : ""}
        `;
    }

    private _goBack(): void {
        fireEvent(this, "go-back");
    }

    private _toggleMode(): void {
        this._editorElement?.toggleMode();
    }

    private _handleGUIModeChanged(ev: HASSDomEvent<GUIModeChangedEvent>): void {
        ev.stopPropagation();
        this._guiMode = ev.detail.guiMode;
        this._guiModeAvailable = ev.detail.guiModeAvailable;
    }

    private _handleConfigChanged(ev: CustomEvent): void {
        this._guiModeAvailable = ev.detail.guiModeAvailable;
    }

    static get styles(): CSSResultGroup {
        return css`
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .back-title {
                display: flex;
                align-items: center;
                font-size: 18px;
            }
            ha-icon {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hui-scene-card-sub-element-editor": MushroomSceneCardSubElementEditor;
    }
}
