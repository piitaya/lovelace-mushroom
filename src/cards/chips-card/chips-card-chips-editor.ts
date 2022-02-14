import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { guard } from "lit/directives/guard.js";
import type { SortableEvent } from "sortablejs";
import setupCustomlocalize from "../../localize";
import { getChipElementClass } from "../../utils/lovelace/chip-element-editor";
import { CHIP_LIST, LovelaceChipConfig } from "../../utils/lovelace/chip/types";
import { sortableStyles } from "../../utils/sortable-styles";

let Sortable;

declare global {
    interface HASSDomEvents {
        "chips-changed": {
            chips: LovelaceChipConfig[];
        };
    }
}

@customElement("mushroom-chips-card-chips-editor")
export class ChipsCardEditorChips extends LitElement {
    @property({ attribute: false }) protected hass?: HomeAssistant;

    @property({ attribute: false }) protected chips?: LovelaceChipConfig[];

    @property() protected label?: string;

    @state() private _attached = false;

    @state() private _renderEmptySortable = false;

    private _sortable?;

    public connectedCallback() {
        super.connectedCallback();
        this._attached = true;
    }

    public disconnectedCallback() {
        super.disconnectedCallback();
        this._attached = false;
    }

    protected render(): TemplateResult {
        if (!this.chips || !this.hass) {
            return html``;
        }

        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <h3>
                ${this.label ||
                `${customLocalize("editor.chip.chip-picker.chips")} (${this.hass!.localize(
                    "ui.panel.lovelace.editor.card.config.required"
                )})`}
            </h3>
            <div class="chips">
                ${guard([this.chips, this._renderEmptySortable], () =>
                    this._renderEmptySortable
                        ? ""
                        : this.chips!.map(
                              (chipConf, index) => html`
                                  <div class="chip">
                                      <ha-icon class="handle" icon="mdi:drag"></ha-icon>
                                      ${html`
                                          <div class="special-row">
                                              <div>
                                                  <span> ${renderChipLabel(chipConf)} </span>
                                                  <span class="secondary"
                                                      >${customLocalize(
                                                          "editor.chip.chip-picker.details"
                                                      )}</span
                                                  >
                                              </div>
                                          </div>
                                      `}
                                      <ha-icon-button
                                          .label=${customLocalize("editor.chip.chip-picker.clear")}
                                          class="remove-icon"
                                          .index=${index}
                                          @click=${this._removeChip}
                                      >
                                          <ha-icon icon="mdi:close"></ha-icon
                                      ></ha-icon-button>
                                      <ha-icon-button
                                          .label=${customLocalize("editor.chip.chip-picker.edit")}
                                          class="edit-icon"
                                          .index=${index}
                                          @click=${this._editChip}
                                      >
                                          <ha-icon icon="mdi:pencil"></ha-icon>
                                      </ha-icon-button>
                                  </div>
                              `
                          )
                )}
            </div>
            <paper-dropdown-menu
                .placeholder=${customLocalize("editor.chip.chip-picker.add")}
                @iron-select=${this._addChips}
            >
                <paper-listbox slot="dropdown-content" attr-for-selected="data-type">
                    ${CHIP_LIST.map(
                        (chip) => html`
                            <paper-item data-type="${chip}" }
                                >${capitalizeFirstLetter(chip)}</paper-item
                            >
                        `
                    )}
                </paper-listbox>
            </paper-dropdown-menu>
        `;
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        const attachedChanged = changedProps.has("_attached");
        const chipsChanged = changedProps.has("chips");

        if (!chipsChanged && !attachedChanged) {
            return;
        }

        if (attachedChanged && !this._attached) {
            // Tear down sortable, if available
            this._sortable?.destroy();
            this._sortable = undefined;
            return;
        }

        if (!this._sortable && this.chips) {
            this._createSortable();
            return;
        }

        if (chipsChanged) {
            this._handleChipsChanged();
        }
    }

    private async _handleChipsChanged() {
        this._renderEmptySortable = true;
        await this.updateComplete;
        const container = this.shadowRoot!.querySelector(".chips")!;
        while (container.lastElementChild) {
            container.removeChild(container.lastElementChild);
        }
        this._renderEmptySortable = false;
    }

    private async _createSortable() {
        if (!Sortable) {
            const sortableImport = await import("sortablejs/modular/sortable.core.esm");

            Sortable = sortableImport.Sortable;
            Sortable.mount(sortableImport.OnSpill);
            Sortable.mount(sortableImport.AutoScroll());
        }

        this._sortable = new Sortable(this.shadowRoot!.querySelector(".chips"), {
            animation: 150,
            fallbackClass: "sortable-fallback",
            handle: ".handle",
            onEnd: async (evt: SortableEvent) => this._chipMoved(evt),
        });
    }

    private async _addChips(ev: CustomEvent): Promise<void> {
        const value = ev.detail.item.dataset.type as any;
        (ev.target as any).selected = "";

        if (value === "") {
            return;
        }

        let newChip: LovelaceChipConfig;

        // Check if a stub config exists
        const elClass = getChipElementClass(value) as any;

        if (elClass && elClass.getStubConfig) {
            newChip = (await elClass.getStubConfig(this.hass)) as LovelaceChipConfig;
        } else {
            newChip = { type: value };
        }

        const newConfigChips = this.chips!.concat(newChip);
        (ev.target as any).selected = "";
        fireEvent(this, "chips-changed", {
            chips: newConfigChips,
        });
    }

    private _chipMoved(ev: SortableEvent): void {
        if (ev.oldIndex === ev.newIndex) {
            return;
        }

        const newChips = this.chips!.concat();

        newChips.splice(ev.newIndex!, 0, newChips.splice(ev.oldIndex!, 1)[0]);

        fireEvent(this, "chips-changed", { chips: newChips });
    }

    private _removeChip(ev: CustomEvent): void {
        const index = (ev.currentTarget as any).index;
        const newConfigChips = this.chips!.concat();

        newConfigChips.splice(index, 1);

        fireEvent(this, "chips-changed", {
            chips: newConfigChips,
        });
    }

    private _editChip(ev: CustomEvent): void {
        const index = (ev.currentTarget as any).index;
        fireEvent<any>(this, "edit-detail-element", {
            subElementConfig: {
                index,
                type: "chip",
                elementConfig: this.chips![index],
            },
        });
    }

    static get styles(): CSSResultGroup {
        return [
            sortableStyles,
            css`
                .chip {
                    display: flex;
                    align-items: center;
                }

                ha-icon {
                    display: flex;
                }

                paper-dropdown-menu {
                    width: 100%;
                }

                .chip .handle {
                    padding-right: 8px;
                    cursor: move;
                }

                .special-row {
                    height: 60px;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-grow: 1;
                }

                .special-row div {
                    display: flex;
                    flex-direction: column;
                }

                .remove-icon,
                .edit-icon {
                    --mdc-icon-button-size: 36px;
                    color: var(--secondary-text-color);
                }

                .secondary {
                    font-size: 12px;
                    color: var(--secondary-text-color);
                }
            `,
        ];
    }
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderChipLabel(chipConf: LovelaceChipConfig): string {
    let label = capitalizeFirstLetter(chipConf.type);
    if ("entity" in chipConf && chipConf.entity) {
        label += ` - ${chipConf.entity}`;
    }
    return label;
}
