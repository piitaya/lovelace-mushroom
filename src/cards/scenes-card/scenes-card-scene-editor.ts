import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { guard } from "lit/directives/guard.js";
import setupCustomlocalize from "../../localize";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { sortableStyles } from "../../utils/sortable-styles";
import { SCENES_CARD_EDITOR_NAME } from "./const";
import { SceneCardConfig } from "../../utils/lovelace/scene/types";
import type { SortableEvent } from "sortablejs";
import { getSceneElementClass } from "./editors/scene-element-editor";

let Sortable;

declare global {
    interface HASSDomEvents {
        "scenes-changed": {
            scenes: SceneCardConfig[];
        };
    }
}

@customElement(SCENES_CARD_EDITOR_NAME)
export class ScenesCardEditor extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @property({ attribute: false }) protected scenes?: SceneCardConfig[];

    @state() private _renderEmptySortable = false;

    private _sortable?;

    connectedCallback() {
        super.connectedCallback();
    }

    public disconnectedCallback() {
        super.disconnectedCallback();
    }

    protected render(): TemplateResult {
        if (!this.scenes || !this.hass) {
            return html``;
        }

        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <div class="scenes">
                ${guard([this.scenes, this._renderEmptySortable], () =>
                    this._renderEmptySortable
                        ? ""
                        : this.scenes!.map(
                              (sceneConfig, index) => html`
                                  <div class="scene">
                                      <ha-icon class="handle" icon="mdi:drag"></ha-icon>
                                      ${html`
                                          <div class="special-row">
                                              <div>
                                                  <span>
                                                      ${this._renderSceneLabel(sceneConfig)}
                                                  </span>
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
                                          @click=${this._removeScene}
                                      >
                                          <ha-icon icon="mdi:close"></ha-icon
                                      ></ha-icon-button>
                                      <ha-icon-button
                                          .label=${customLocalize("editor.chip.chip-picker.edit")}
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
        `;
    }

    private _renderSceneLabel(sceneConfig: SceneCardConfig): string {
        const customLocalize = setupCustomlocalize(this.hass);
        let label = customLocalize(`editor.chip.chip-picker.types.${sceneConfig.type}`);
        if ("entity" in sceneConfig && sceneConfig.entity) {
            label += ` - ${sceneConfig.entity}`;
        }
        return label;
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
            onEnd: async (evt: SortableEvent) => this._sceneMoved(evt),
        });
    }

    private async _addScenes(ev: any): Promise<void> {
        const target = ev.target! as EditorTarget;
        const value = target.value as string;

        if (value === "") {
            return;
        }

        let newScene: SceneCardConfig;

        // Check if a stub config exists
        const elClass = getSceneElementClass(value) as any;

        if (elClass && elClass.getStubConfig) {
            newScene = (await elClass.getStubConfig(this.hass)) as SceneCardConfig;
        } else {
            newScene = { type: value } as SceneCardConfig;
        }

        const newConfigScenes = this.scenes!.concat(newScene);
        target.value = "";
        fireEvent(this, "scenes-changed", {
            scenes: newConfigScenes,
        });
    }

    private _sceneMoved(ev: SortableEvent): void {
        if (ev.oldIndex === ev.newIndex) {
            return;
        }

        const newScenes = this.scenes!.concat();

        newScenes.splice(ev.newIndex!, 0, newScenes.splice(ev.oldIndex!, 1)[0]);

        fireEvent(this, "scenes-changed", { scenes: newScenes });
    }

    private _removeScene(ev: CustomEvent): void {
        const index = (ev.currentTarget as any).index;
        const newConfigScenes = this.scenes!.concat();

        newConfigScenes.splice(index, 1);

        fireEvent(this, "scenes-changed", {
            scenes: newConfigScenes,
        });
    }

    private _editScene(ev: CustomEvent): void {
        const index = (ev.currentTarget as any).index;
        fireEvent<any>(this, "edit-detail-element", {
            subElementConfig: {
                index,
                type: "scene",
                elementConfig: this.scenes![index],
            },
        });
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
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
