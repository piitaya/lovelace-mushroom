import { SelectBase } from "@material/mwc-select/mwc-select-base";
import { styles } from "@material/mwc-select/mwc-select.css";
import { css, CSSResult, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { debounce, nextRender } from "../../ha";

@customElement("mushroom-select")
export class MushroomSelect extends SelectBase {
  // @ts-ignore
  @property({ type: Boolean }) public icon?: boolean;

  // @ts-ignore
  protected override renderLeadingIcon() {
    if (!this.icon) {
      return nothing;
    }

    return html`<span class="mdc-select__icon"
      ><slot name="icon"></slot
    ></span>`;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("translations-updated", this._translationsUpdated);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "translations-updated",
      this._translationsUpdated
    );
  }

  private _translationsUpdated = debounce(async () => {
    await nextRender();
    this.layoutOptions();
  }, 500);

  static override styles: CSSResult[] = [
    // @ts-ignore
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
