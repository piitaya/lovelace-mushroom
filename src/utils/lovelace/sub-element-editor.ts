import { fireEvent, HASSDomEvent, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { LovelaceChipConfig } from "./chip/types";
import { GUIModeChangedEvent, SubElementEditorConfig } from "./editor/types";
import type { MushroomElementEditor } from "./element-editor";
import "./chip-element-editor";

declare global {
    interface HASSDomEvents {
        "go-back": undefined;
    }
}

@customElement("mushroom-sub-element-editor")
export class MushroomSubElementEditor extends LitElement {
    public hass!: HomeAssistant;

    @property({ attribute: false }) public config!: SubElementEditorConfig;

    @state() private _guiModeAvailable = true;

    @state() private _guiMode = true;

    @query(".editor")
    private _editorElement?: MushroomElementEditor<LovelaceChipConfig>;

    protected render(): TemplateResult {
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
                        >${this.hass.localize(
                            `ui.panel.lovelace.editor.sub-element-editor.types.${this.config?.type}`
                        )}</span
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
            ${this.config.type === "chip"
                ? html`
                      <mushroom-chip-element-editor
                          class="editor"
                          .hass=${this.hass}
                          .value=${this.config.elementConfig}
                          @config-changed=${this._handleConfigChanged}
                          @GUImode-changed=${this._handleGUIModeChanged}
                      ></mushroom-chip-element-editor>
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
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hui-sub-element-editor": MushroomSubElementEditor;
    }
}
