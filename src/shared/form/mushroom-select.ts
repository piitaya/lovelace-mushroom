import { SelectBase } from "@material/mwc-select/mwc-select-base";
import { styles } from "@material/mwc-select/mwc-select.css";
import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import {classMap} from 'lit/directives/class-map.js';
import { debounce, nextRender } from "../../ha";
import './mushroom-select-menu.js'


@customElement("mushroom-select")
export class MushroomSelect extends SelectBase {
    // @ts-ignore
    @property({ type: Boolean }) public icon?: boolean;

    protected override renderLeadingIcon() {
        if (!this.icon) {
            return nothing;
        }

        return html`<span class="mdc-select__icon"><slot name="icon"></slot></span>`;
    }

    override renderMenu() {
        const classes = this.getMenuClasses();
        // swap out mwc-menu for mushroom-select-menu. Bindings and template taken from source.
        return html`
          <mushroom-select-menu
            innerRole="listbox"
            wrapFocus
            class=" ${classMap(classes)}"
            activatable
            .fullwidth=${this.fixedMenuPosition ? false : !this.naturalMenuWidth}
            .open=${this.menuOpen}
            .anchor=${this.anchorElement}
            @selected=${this.onSelected}
            @opened=${this.onOpened}
            @closed=${this.onClosed}
            @items-updated=${this.onItemsUpdated}
            @keydown=${this.handleTypeahead}>
          ${this.renderMenuContent()}
        </mushroom-select-menu>`;
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("translations-updated", this._translationsUpdated);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("translations-updated", this._translationsUpdated);
    }

    private _translationsUpdated = debounce(async () => {
        await nextRender();
        this.layoutOptions();
    }, 500);

    static override styles = [
        styles,
        css`
            .mdc-select__anchor {
                height: var(--select-height, 56px) !important;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "mushroom-select": MushroomSelect;
    }
}

