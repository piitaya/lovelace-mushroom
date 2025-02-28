import { css, CSSResultGroup, html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { guard } from "lit/directives/guard.js";
import type { SortableEvent } from "sortablejs";
import { fireEvent, sortableStyles } from "../../ha";
import setupCustomlocalize from "../../localize";
import "../../shared/form/mushroom-select";
import { MushroomBaseElement } from "../../utils/base-element";
import { getChipElementClass } from "../../utils/lovelace/chip-element-editor";
import { CHIP_LIST, LovelaceChipConfig } from "../../utils/lovelace/chip/types";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { HassEntity } from "home-assistant-js-websocket";
import { setupConditionChipComponent } from "./chips/conditional-chip";

let Sortable;

declare global {
  interface HASSDomEvents {
    "chips-changed": {
      chips: LovelaceChipConfig[];
    };
  }
}

const NON_EDITABLE_CHIPS = new Set<LovelaceChipConfig["type"]>(["spacer"]);

@customElement("mushroom-chips-card-chips-editor")
export class ChipsCardEditorChips extends MushroomBaseElement {
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

  protected render() {
    if (!this.chips || !this.hass) {
      return nothing;
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
                    <div class="handle">
                      <ha-icon icon="mdi:drag"></ha-icon>
                    </div>
                    ${html`
                      <div class="special-row">
                        <div>
                          <span> ${this._renderChipLabel(chipConf)}</span>
                          <span class="secondary">
                            ${this._renderChipSecondary(chipConf)}
                          </span>
                        </div>
                      </div>
                    `}
                    ${NON_EDITABLE_CHIPS.has(chipConf.type)
                      ? nothing
                      : html`
                          <ha-icon-button
                            .label=${customLocalize(
                              "editor.chip.chip-picker.edit"
                            )}
                            class="edit-icon"
                            .index=${index}
                            @click=${this._editChip}
                          >
                            <ha-icon icon="mdi:pencil"></ha-icon>
                          </ha-icon-button>
                        `}
                    <ha-icon-button
                      .label=${customLocalize("editor.chip.chip-picker.clear")}
                      class="remove-icon"
                      .index=${index}
                      @click=${this._removeChip}
                    >
                      <ha-icon icon="mdi:close"></ha-icon>
                    </ha-icon-button>
                  </div>
                `
              )
        )}
      </div>
      <mushroom-select
        .label=${customLocalize("editor.chip.chip-picker.add")}
        @selected=${this._addChips}
        @closed=${(e) => e.stopPropagation()}
        fixedMenuPosition
        naturalMenuWidth
      >
        ${CHIP_LIST.map(
          (chip) => html`
            <mwc-list-item .value=${chip}>
              ${customLocalize(`editor.chip.chip-picker.types.${chip}`)}
            </mwc-list-item>
          `
        )}
      </mushroom-select>
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
      const sortableImport = await import(
        "sortablejs/modular/sortable.core.esm"
      );

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

  private async _addChips(ev: any): Promise<void> {
    const target = ev.target! as EditorTarget;
    const value = target.value as string;

    if (value === "") {
      return;
    }

    let newChip: LovelaceChipConfig;

    if (value === "conditional") {
      await setupConditionChipComponent();
    }

    // Check if a stub config exists
    const elClass = getChipElementClass(value) as any;

    if (elClass && elClass.getStubConfig) {
      newChip = (await elClass.getStubConfig(this.hass)) as LovelaceChipConfig;
    } else {
      newChip = { type: value } as LovelaceChipConfig;
    }

    const newConfigChips = this.chips!.concat(newChip);
    target.value = "";
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

  private _renderChipLabel(chipConf: LovelaceChipConfig): string {
    const customLocalize = setupCustomlocalize(this.hass);
    return customLocalize(`editor.chip.chip-picker.types.${chipConf.type}`);
  }

  private _renderChipSecondary(
    chipConf: LovelaceChipConfig
  ): string | undefined {
    const customLocalize = setupCustomlocalize(this.hass);
    if ("entity" in chipConf && chipConf.entity) {
      return `${this.getEntityName(chipConf.entity) ?? chipConf.entity ?? ""}`;
    }
    if ("chip" in chipConf && chipConf.chip) {
      const label = customLocalize(
        `editor.chip.chip-picker.types.${chipConf.chip.type}`
      );
      const chipSecondary = this._renderChipSecondary(chipConf.chip);
      if (chipSecondary) {
        return `${this._renderChipSecondary(chipConf.chip)} (via ${label})`;
      }
      return label;
    }
    return "";
  }

  private getEntityName(entity_id: string): string | undefined {
    if (!this.hass) return undefined;
    const stateObj = this.hass.states[entity_id] as HassEntity | undefined;
    if (!stateObj) return undefined;
    return stateObj.attributes.friendly_name;
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      sortableStyles,
      css`
        .chip {
          display: flex;
          align-items: center;
        }

        ha-icon {
          display: flex;
        }

        mushroom-select {
          width: 100%;
        }

        .chip .handle {
          padding-right: 8px;
          cursor: move;
        }

        .chip .handle > * {
          pointer-events: none;
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
