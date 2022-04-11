import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { guard } from "lit/directives/guard.js";
import type { SortableEvent } from "sortablejs";
import setupCustomlocalize from "../../localize";
import { getSceneElementClass } from "../../utils/lovelace/scene-element-editor";
import { ITEM_LIST, LovelaceSceneConfig } from "../../utils/lovelace/scene/types";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { sortableStyles } from "../../utils/sortable-styles";
import "../../shared/form/mushroom-select";

let Sortable;

declare global {
    interface HASSDomEvents {
        "items-changed": {
            items: LovelaceSceneConfig[];
        };
    }
}

@customElement("mushroom-scenes-card-scenes-editor")
export class ScenesCardEditorScenes extends LitElement {
    @property({ attribute: false }) protected hass?: HomeAssistant;

    @property({ attribute: false }) protected items?: LovelaceSceneConfig[];

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
        if (!this.items || !this.hass) {
            return html``;
        }

        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <h3>
                ${this.label ||
                `${customLocalize("editor.scene.scene-picker.scenes")} (${this.hass!.localize(
                    "ui.panel.lovelace.editor.card.config.required"
                )})`}
            </h3>
            <div class="items">
                ${guard([this.items, this._renderEmptySortable], () =>
                    this._renderEmptySortable
                        ? ""
                        : this.items!.map(
                              (sceneConf, index) => html`
                                  <div class="item">
                                      <ha-icon class="handle" icon="mdi:drag"></ha-icon>
                                      ${html`
                                          <div class="special-row">
                                              <div>
                                                  <span>
                                                      ${this._renderSceneLabel(sceneConf)}
                                                  </span>
                                                  <span class="secondary"
                                                      >${customLocalize(
                                                          "editor.scene.scene-picker.details"
                                                      )}</span
                                                  >
                                              </div>
                                          </div>
                                      `}
                                      <ha-icon-button
                                          .label=${customLocalize(
                                              "editor.scene.scene-picker.clear"
                                          )}
                                          class="remove-icon"
                                          .index=${index}
                                          @click=${this._removeScene}
                                      >
                                          <ha-icon icon="mdi:close"></ha-icon
                                      ></ha-icon-button>
                                      <ha-icon-button
                                          .label=${customLocalize("editor.scene.scene-picker.edit")}
                                          class="edit-icon"
                                          .index=${index}
                                          @click=${this._editScene}
                                      >
                                          <ha-icon icon="mdi:pencil"></ha-icon>
                                      </ha-icon-button>
                                  </div>
                              `
                          )
                )}
            </div>
            <mushroom-select
                .label=${customLocalize("editor.scene.scene-picker.add")}
                @selected=${this._addScenes}
                @closed=${(e) => e.stopPropagation()}
                fixedMenuPosition
                naturalMenuWidth
            >
                ${ITEM_LIST.map(
                    (scene) =>
                        html`
                            <mwc-list-item .value=${scene}>
                                ${customLocalize(`editor.scene.scene-picker.types.${scene}`)}
                            </mwc-list-item>
                        `
                )}
            </mushroom-select>
        `;
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        const attachedChanged = changedProps.has("_attached");
        const itemsChanged = changedProps.has("items");

        if (!itemsChanged && !attachedChanged) {
            return;
        }

        if (attachedChanged && !this._attached) {
            // Tear down sortable, if available
            this._sortable?.destroy();
            this._sortable = undefined;
            return;
        }

        if (!this._sortable && this.items) {
            this._createSortable();
            return;
        }

        if (itemsChanged) {
            this._handleItemsChanged();
        }
    }

    private async _handleItemsChanged() {
        this._renderEmptySortable = true;
        await this.updateComplete;
        const container = this.shadowRoot!.querySelector(".items")!;
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

        this._sortable = new Sortable(this.shadowRoot!.querySelector(".items"), {
            animation: 150,
            fallbackClass: "sortable-fallback",
            handle: ".handle",
            onEnd: async (evt: SortableEvent) => this._sceneMoved(evt),
        });
    }

    private async _addScenes(ev: any): Promise<void> {
        const target = ev.target! as EditorTarget;
        const value = target.value as string;

        if (value === "") {
            return;
        }

        let newScene: LovelaceSceneConfig;

        // Check if a stub config exists
        const elClass = getSceneElementClass(value) as any;

        if (elClass && elClass.getStubConfig) {
            newScene = (await elClass.getStubConfig(this.hass)) as LovelaceSceneConfig;
        } else {
            newScene = { type: value } as LovelaceSceneConfig;
        }

        const newConfigScenes = this.items!.concat(newScene);
        target.value = "";
        fireEvent(this, "items-changed", {
            items: newConfigScenes,
        });
    }

    private _sceneMoved(ev: SortableEvent): void {
        if (ev.oldIndex === ev.newIndex) {
            return;
        }

        const newScenes = this.items!.concat();

        newScenes.splice(ev.newIndex!, 0, newScenes.splice(ev.oldIndex!, 1)[0]);

        fireEvent(this, "items-changed", { items: newScenes });
    }

    private _removeScene(ev: CustomEvent): void {
        const index = (ev.currentTarget as any).index;
        const newConfigScenes = this.items!.concat();

        newConfigScenes.splice(index, 1);

        fireEvent(this, "items-changed", {
            items: newConfigScenes,
        });
    }

    private _editScene(ev: CustomEvent): void {
        const index = (ev.currentTarget as any).index;
        fireEvent<any>(this, "edit-detail-element", {
            subElementConfig: {
                index,
                type: "scene",
                elementConfig: this.items![index],
            },
        });
    }

    private _renderSceneLabel(sceneConf: LovelaceSceneConfig): string {
        const customLocalize = setupCustomlocalize(this.hass);
        let label = customLocalize(`editor.scene.scene-picker.types.${sceneConf.type}`);
        if ("entity" in sceneConf && sceneConf.entity) {
            label += ` - ${sceneConf.entity}`;
        }
        return label;
    }

    static get styles(): CSSResultGroup {
        return [
            sortableStyles,
            css`
                .scene {
                    display: flex;
                    align-items: center;
                }

                ha-icon {
                    display: flex;
                }

                mushroom-select {
                    width: 100%;
                }

                .scene .handle {
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
