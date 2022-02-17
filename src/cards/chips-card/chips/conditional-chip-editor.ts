import type { MDCTabBarActivatedEvent } from "@material/tab-bar";
import { fireEvent, HASSDomEvent, HomeAssistant, LovelaceConfig } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import setupCustomlocalize from "../../../localize";
import { configElementStyle } from "../../../utils/editor-styles";
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
export class ConditionalChipEditor extends LitElement implements LovelaceChipEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @property({ attribute: false }) public lovelace?: LovelaceConfig;

    @state() private _config?: ConditionalChipConfig;

    @state() private _GUImode = true;

    @state() private _guiModeAvailable? = true;

    @state() private _cardTab = false;

    @query("mushroom-chip-element-editor")
    private _cardEditorEl?: any;

    public setConfig(config: ConditionalChipConfig): void {
        this._config = config;
    }

    public focusYamlEditor() {
        this._cardEditorEl?.focusYamlEditor();
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
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
                <mwc-tab .label=${customLocalize("editor.chip.conditional.chip")}></mwc-tab>
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
                                        .value=${this._config.chip}
                                        @config-changed=${this._handleChipChanged}
                                        @GUImode-changed=${this._handleGUIModeChanged}
                                    ></mushroom-chip-element-editor>
                                `
                              : html`
                                    <paper-dropdown-menu
                                        .placeholder=${customLocalize(
                                            "editor.chip.chip-picker.select"
                                        )}
                                        @iron-select=${this._handleChipPicked}
                                    >
                                        <paper-listbox
                                            slot="dropdown-content"
                                            attr-for-selected="data-type"
                                        >
                                            ${CHIP_LIST.map(
                                                (chip) => html`
                                                    <paper-item data-type="${chip}" }
                                                        >${capitalizeFirstLetter(chip)}</paper-item
                                                    >
                                                `
                                            )}
                                        </paper-listbox>
                                    </paper-dropdown-menu>
                                `}
                      </div>
                  `
                : html`
                      <div class="conditions">
                          ${this.hass!.localize(
                              "ui.panel.lovelace.editor.card.conditional.condition_explanation"
                          )}
                          ${this._config.conditions.map(
                              (cond, idx) => html`
                                  <div class="condition">
                                      <div class="entity">
                                          <ha-entity-picker
                                              .hass=${this.hass}
                                              .value=${cond.entity}
                                              .index=${idx}
                                              .configValue=${"entity"}
                                              @change=${this._changeCondition}
                                              allow-custom-entity
                                          ></ha-entity-picker>
                                      </div>
                                      <div class="state">
                                          <paper-dropdown-menu>
                                              <paper-listbox
                                                  .selected=${cond.state_not !== undefined ? 1 : 0}
                                                  slot="dropdown-content"
                                                  .index=${idx}
                                                  .configValue=${"invert"}
                                                  @selected-item-changed=${this._changeCondition}
                                              >
                                                  <paper-item
                                                      >${this.hass!.localize(
                                                          "ui.panel.lovelace.editor.card.conditional.state_equal"
                                                      )}</paper-item
                                                  >
                                                  <paper-item
                                                      >${this.hass!.localize(
                                                          "ui.panel.lovelace.editor.card.conditional.state_not_equal"
                                                      )}</paper-item
                                                  >
                                              </paper-listbox>
                                          </paper-dropdown-menu>
                                          <paper-input
                                              .label="${this.hass!.localize(
                                                  "ui.panel.lovelace.editor.card.generic.state"
                                              )} (${this.hass!.localize(
                                                  "ui.panel.lovelace.editor.card.conditional.current_state"
                                              )}: ${this.hass?.states[cond.entity].state})"
                                              .value=${cond.state_not !== undefined
                                                  ? cond.state_not
                                                  : cond.state}
                                              .index=${idx}
                                              .configValue=${"state"}
                                              @value-changed=${this._changeCondition}
                                          ></paper-input>
                                      </div>
                                  </div>
                              `
                          )}
                          <div class="condition">
                              <ha-entity-picker
                                  .hass=${this.hass}
                                  @change=${this._addCondition}
                              ></ha-entity-picker>
                          </div>
                      </div>
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
        const value = ev.detail.item.dataset.type as any;
        (ev.target as any).selected = "";

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

        (ev.target as any).selected = "";

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

    private _addCondition(ev: Event): void {
        const target = ev.target! as any;
        if (target.value === "" || !this._config) {
            return;
        }
        const conditions = [...this._config.conditions];
        conditions.push({
            entity: target.value,
            state: "",
        });
        this._config = { ...this._config, conditions };
        target.value = "";
        fireEvent(this, "config-changed", { config: this._config });
    }

    private _changeCondition(ev: Event): void {
        const target = ev.target as any;
        if (!this._config || !target) {
            return;
        }
        const conditions = [...this._config.conditions];
        if (target.configValue === "entity" && target.value === "") {
            conditions.splice(target.index, 1);
        } else {
            const condition = { ...conditions[target.index] };
            if (target.configValue === "entity") {
                condition.entity = target.value;
            } else if (target.configValue === "state") {
                if (condition.state_not !== undefined) {
                    condition.state_not = target.value;
                } else {
                    condition.state = target.value;
                }
            } else if (target.configValue === "invert") {
                if (target.selected === 1) {
                    if (condition.state) {
                        condition.state_not = condition.state;
                        delete condition.state;
                    }
                } else if (condition.state_not) {
                    condition.state = condition.state_not;
                    delete condition.state_not;
                }
            }
            conditions[target.index] = condition;
        }
        this._config = { ...this._config, conditions };
        fireEvent(this, "config-changed", { config: this._config });
    }

    static get styles(): CSSResultGroup {
        return [
            configElementStyle,
            css`
                mwc-tab-bar {
                    border-bottom: 1px solid var(--divider-color);
                }
                .conditions {
                    margin-top: 8px;
                }
                .condition {
                    margin-top: 8px;
                    border: 1px solid var(--divider-color);
                    padding: 12px;
                }
                .condition .state {
                    display: flex;
                    align-items: flex-end;
                }
                .condition .state paper-dropdown-menu {
                    margin-right: 16px;
                }
                .condition .state paper-input {
                    flex-grow: 1;
                }

                .card {
                    margin-top: 8px;
                    border: 1px solid var(--divider-color);
                    padding: 12px;
                }
                @media (max-width: 450px) {
                    .card,
                    .condition {
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
            `,
        ];
    }
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
