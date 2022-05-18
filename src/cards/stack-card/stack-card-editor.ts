import {
    fireEvent,
    HASSDomEvent,
    LovelaceCardConfig,
    LovelaceCardEditor,
    LovelaceConfig,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { GUIModeChangedEvent } from "../../utils/lovelace/editor/types";
import { ConfigChangedEvent } from "../../utils/lovelace/element-editor";
import { STACK_CARD_EDITOR_NAME } from "./const";
import { StackCardConfig, stackCardConfigStruct } from "./stack-card-config";

const computeSchema = memoizeOne((): HaFormSchema[] => [
    { name: "title", selector: { text: {} } },
    { name: "layout", selector: { "mush-layout": {} } },
]);

@customElement(STACK_CARD_EDITOR_NAME)
export class StackCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @property({ attribute: false }) public lovelace?: LovelaceConfig;

    @state() private _config?: StackCardConfig;

    @state() protected _selectedCard = 0;

    @state() protected _GUImode = true;

    @state() protected _guiModeAvailable? = true;

    @state() private _helpers?: any;

    @query("hui-card-element-editor")
    protected _cardEditorEl?: any;

    private _initialized = false;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: StackCardConfig): void {
        assert(config, stackCardConfigStruct);
        this._config = config;
        this._loadCardHelpers();
    }

    protected shouldUpdate(): boolean {
        if (!this._initialized) {
            this._initialize();
        }

        return true;
    }

    private async _loadCardHelpers(): Promise<void> {
        this._helpers = await (window as any).loadCardHelpers();
    }

    private _initialize(): void {
        if (this.hass === undefined) return;
        if (this._config === undefined) return;
        if (this._helpers === undefined) return;
        this._initialized = true;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const selected = this._selectedCard;
        const numcards = this._config.cards.length;
        const schema = computeSchema();
        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>

            <ha-yaml-editor
                .hass=${this.hass}
                .label=${customLocalize(`editor.stack.styles`)}
                .defaultValue=${this._config.styles || ""}
                @value-changed=${this._stylesChanged}
            >
            </ha-yaml-editor>
            <div class="toolbar">
                <paper-tabs
                    .selected=${selected}
                    scrollable
                    @iron-activate=${this._handleSelectedCard}
                >
                    ${this._config.cards.map(
                        (_card, i) => html` <paper-tab> ${i + 1} </paper-tab> `
                    )}
                </paper-tabs>
                <paper-tabs
                    id="add-card"
                    .selected=${selected === numcards ? "0" : undefined}
                    @iron-activate=${this._handleSelectedCard}
                >
                    <paper-tab>
                        <ha-icon icon="mdi:plus"></ha-icon>
                    </paper-tab>
                </paper-tabs>
            </div>
            <div id="editor">
          ${
              selected < numcards
                  ? html`
                        <div id="card-options">
                            <mwc-button
                                @click=${this._toggleMode}
                                .disabled=${!this._guiModeAvailable}
                                class="gui-mode-button"
                            >
                                ${this.hass.localize(
                                    !this._cardEditorEl || this._GUImode
                                        ? "ui.panel.lovelace.editor.edit_card.show_code_editor"
                                        : "ui.panel.lovelace.editor.edit_card.show_visual_editor"
                                )}
                            </mwc-button>
                            <ha-icon-button
                                .disabled=${selected === 0}
                                .label=${this.hass.localize(
                                    "ui.panel.lovelace.editor.edit_card.move_before"
                                )}
                                @click=${this._handleMove}
                                .move=${-1}
                            >
                                <ha-icon icon="mdi:arrow-left"></ha-icon
                            ></ha-icon-button>
                            <ha-icon-button
                                .label=${this.hass.localize(
                                    "ui.panel.lovelace.editor.edit_card.move_after"
                                )}
                                .disabled=${selected === numcards - 1}
                                @click=${this._handleMove}
                                .move=${1}
                                ><ha-icon icon="mdi:arrow-right"></ha-icon
                            ></ha-icon-button>
                            <ha-icon-button
                                .label=${this.hass.localize(
                                    "ui.panel.lovelace.editor.edit_card.delete"
                                )}
                                @click=${this._handleDeleteCard}
                                ><ha-icon icon="mdi:delete"></ha-icon
                            ></ha-icon-button>
                        </div>
                        <hui-card-element-editor
                            .hass=${this.hass}
                            .value=${this._config.cards[selected]}
                            .lovelace=${this.lovelace}
                            @config-changed=${this._handleConfigChanged}
                            @GUImode-changed=${this._handleGUIModeChanged}
                        ></hui-card-element-editor>
                    `
                  : html`
                        <hui-card-picker
                            .hass=${this.hass}
                            .lovelace=${this.lovelace}
                            @config-changed=${this._handleCardPicked}
                        ></hui-card-picker>
                    `
          }
        </div>
      </div>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    protected _handleSelectedCard(ev) {
        if (ev.target.id === "add-card") {
            this._selectedCard = this._config?.cards.length || 0;
            return;
        }
        this._setMode(true);
        this._guiModeAvailable = true;
        this._selectedCard = parseInt(ev.detail.selected, 10);
    }

    protected _handleConfigChanged(ev: HASSDomEvent<ConfigChangedEvent>) {
        ev.stopPropagation();
        if (!this._config) {
            return;
        }
        const cards = [...this._config.cards];
        cards[this._selectedCard] = ev.detail.config as LovelaceCardConfig;
        this._config = { ...this._config, cards };
        this._guiModeAvailable = ev.detail.guiModeAvailable;
        fireEvent(this, "config-changed", { config: this._config });
    }

    protected _handleCardPicked(ev) {
        ev.stopPropagation();
        if (!this._config) {
            return;
        }
        const config = ev.detail.config;
        const cards = [...this._config.cards, config];
        this._config = { ...this._config, cards };
        fireEvent(this, "config-changed", { config: this._config });
    }

    protected _handleDeleteCard() {
        if (!this._config) {
            return;
        }
        const cards = [...this._config.cards];
        cards.splice(this._selectedCard, 1);
        this._config = { ...this._config, cards };
        this._selectedCard = Math.max(0, this._selectedCard - 1);
        fireEvent(this, "config-changed", { config: this._config });
    }

    protected _handleMove(ev: Event) {
        if (!this._config) {
            return;
        }
        const move = (ev.currentTarget as any).move;
        const source = this._selectedCard;
        const target = source + move;
        const cards = [...this._config.cards];
        const card = cards.splice(this._selectedCard, 1)[0];
        cards.splice(target, 0, card);
        this._config = {
            ...this._config,
            cards,
        };
        this._selectedCard = target;
        fireEvent(this, "config-changed", { config: this._config });
    }

    protected _handleGUIModeChanged(ev: HASSDomEvent<GUIModeChangedEvent>): void {
        ev.stopPropagation();
        this._GUImode = ev.detail.guiMode;
        this._guiModeAvailable = ev.detail.guiModeAvailable;
    }

    protected _toggleMode(): void {
        this._cardEditorEl?.toggleMode();
    }

    protected _setMode(value: boolean): void {
        this._GUImode = value;
        if (this._cardEditorEl) {
            this._cardEditorEl!.GUImode = value;
        }
    }

    private _stylesChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", {
            config: {
                ...this._config,
                styles: ev.detail.value,
            },
        });
    }

    static get styles(): CSSResultGroup {
        return [
          css`
            .toolbar {
              display: flex;
              --paper-tabs-selection-bar-color: var(--primary-color);
              --paper-tab-ink: var(--primary-color);
            }
            paper-tabs {
              display: flex;
              font-size: 14px;
              flex-grow: 1;
            }
            #add-card {
              max-width: 32px;
              padding: 0;
            }
            #card-options {
              display: flex;
              justify-content: flex-end;
              width: 100%;
            }
            #editor {
              border: 1px solid var(--divider-color);
              padding: 12px;
            }
            @media (max-width: 450px) {
              #editor {
                margin: 0 -12px;
              }
            }
            .gui-mode-button {
              margin-right: auto;
            }
          `,
        ];
      }
}
