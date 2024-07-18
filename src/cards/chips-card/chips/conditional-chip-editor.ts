import type { MDCTabBarActivatedEvent } from "@material/tab-bar";
import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  fireEvent,
  HASSDomEvent,
  HomeAssistant,
  LovelaceConfig,
} from "../../../ha";
import setupCustomlocalize from "../../../localize";
import "../../../shared/form/mushroom-select";
import "../../../shared/form/mushroom-textfield";
import { loadHaComponents } from "../../../utils/loader";
import { getChipElementClass } from "../../../utils/lovelace/chip-element-editor";
import { computeChipEditorComponentName } from "../../../utils/lovelace/chip/chip-element";
import {
  CHIP_LIST,
  ConditionalChipConfig,
  LovelaceChipConfig,
} from "../../../utils/lovelace/chip/types";
import { GUIModeChangedEvent } from "../../../utils/lovelace/editor/types";
import { ConfigChangedEvent } from "../../../utils/lovelace/element-editor";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

@customElement(computeChipEditorComponentName("conditional"))
export class ConditionalChipEditor
  extends LitElement
  implements LovelaceChipEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public lovelace?: LovelaceConfig;

  @state() private _config?: ConditionalChipConfig;

  @state() private _GUImode = true;

  @state() private _guiModeAvailable? = true;

  @state() private _cardTab = false;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  @query("mushroom-chip-element-editor")
  private _cardEditorEl?: any;

  public setConfig(config: ConditionalChipConfig): void {
    this._config = config;
  }

  public focusYamlEditor() {
    this._cardEditorEl?.focusYamlEditor();
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const customLocalize = setupCustomlocalize(this.hass);

    return html`
      <mwc-tab-bar
        .activeIndex=${this._cardTab ? 1 : 0}
        @MDCTabBar:activated=${this._selectTab}
      >
        <mwc-tab
          .label=${this.hass!.localize(
            "ui.panel.lovelace.editor.card.conditional.conditions"
          )}
        ></mwc-tab>
        <mwc-tab
          .label=${customLocalize("editor.chip.conditional.chip")}
        ></mwc-tab>
      </mwc-tab-bar>
      ${this._cardTab
        ? html`
            <div class="card">
              ${this._config.chip?.type !== undefined
                ? html`
                    <div class="card-options">
                      <mwc-button
                        @click=${this._toggleMode}
                        .disabled=${!this._guiModeAvailable}
                        class="gui-mode-button"
                      >
                        ${this.hass!.localize(
                          !this._cardEditorEl || this._GUImode
                            ? "ui.panel.lovelace.editor.edit_card.show_code_editor"
                            : "ui.panel.lovelace.editor.edit_card.show_visual_editor"
                        )}
                      </mwc-button>
                      <mwc-button @click=${this._handleReplaceChip}
                        >${this.hass!.localize(
                          "ui.panel.lovelace.editor.card.conditional.change_type"
                        )}</mwc-button
                      >
                    </div>
                    <mushroom-chip-element-editor
                      class="editor"
                      .hass=${this.hass}
                      .value=${this._config.chip as any}
                      @config-changed=${this._handleChipChanged}
                      @GUImode-changed=${this._handleGUIModeChanged}
                    ></mushroom-chip-element-editor>
                  `
                : html`
                    <mushroom-select
                      .label=${customLocalize("editor.chip.chip-picker.select")}
                      @selected=${this._handleChipPicked}
                      @closed=${(e) => e.stopPropagation()}
                      fixedMenuPosition
                      naturalMenuWidth
                    >
                      ${CHIP_LIST.map(
                        (chip) => html`
                          <mwc-list-item .value=${chip}>
                            ${customLocalize(
                              `editor.chip.chip-picker.types.${chip}`
                            )}
                          </mwc-list-item>
                        `
                      )}
                    </mushroom-select>
                  `}
            </div>
          `
        : html`
            <ha-card-conditions-editor
              .hass=${this.hass}
              .conditions=${this._config.conditions}
              @value-changed=${this._conditionChanged}
            ></ha-card-conditions-editor>
          `}
    `;
  }

  private _selectTab(ev: MDCTabBarActivatedEvent): void {
    this._cardTab = ev.detail.index === 1;
  }

  private _toggleMode(): void {
    this._cardEditorEl?.toggleMode();
  }

  private _setMode(value: boolean): void {
    this._GUImode = value;
    if (this._cardEditorEl) {
      this._cardEditorEl.GUImode = value;
    }
  }

  private _handleGUIModeChanged(ev: HASSDomEvent<GUIModeChangedEvent>): void {
    ev.stopPropagation();
    this._GUImode = ev.detail.guiMode;
    this._guiModeAvailable = ev.detail.guiModeAvailable;
  }

  private async _handleChipPicked(ev: CustomEvent): Promise<void> {
    const value = (ev.target as any).value;

    if (value === "") {
      return;
    }

    let newChip: LovelaceChipConfig;

    const elClass = getChipElementClass(value) as any;

    if (elClass && elClass.getStubConfig) {
      newChip = (await elClass.getStubConfig(this.hass)) as LovelaceChipConfig;
    } else {
      newChip = { type: value };
    }

    (ev.target as any).value = "";

    ev.stopPropagation();
    if (!this._config) {
      return;
    }
    this._setMode(true);
    this._guiModeAvailable = true;
    this._config = { ...this._config, chip: newChip };
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _handleChipChanged(ev: HASSDomEvent<ConfigChangedEvent>): void {
    ev.stopPropagation();
    if (!this._config) {
      return;
    }
    this._config = {
      ...this._config,
      chip: ev.detail.config as LovelaceChipConfig,
    };
    this._guiModeAvailable = ev.detail.guiModeAvailable;
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _handleReplaceChip(): void {
    if (!this._config) {
      return;
    }
    // @ts-ignore
    this._config = { ...this._config, chip: undefined };
    // @ts-ignore
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _conditionChanged(ev: CustomEvent) {
    ev.stopPropagation();
    if (!this._config) {
      return;
    }
    const conditions = ev.detail.value;
    this._config = { ...this._config, conditions };
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles(): CSSResultGroup {
    return css`
      mwc-tab-bar {
        border-bottom: 1px solid var(--divider-color);
      }
      .card {
        margin-top: 8px;
        border: 1px solid var(--divider-color);
        padding: 12px;
      }
      .card mushroom-select {
        width: 100%;
        margin-top: 0px;
      }
      @media (max-width: 450px) {
        .card {
          margin: 8px -12px 0;
        }
      }
      .card .card-options {
        display: flex;
        justify-content: flex-end;
        width: 100%;
      }
      .gui-mode-button {
        margin-right: auto;
      }
    `;
  }
}
