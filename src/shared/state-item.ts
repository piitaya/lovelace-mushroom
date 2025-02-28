import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  TemplateResult,
} from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { Appearance } from "./config/appearance-config";
import "./shape-icon";

@customElement("mushroom-state-item")
export class StateItem extends LitElement {
  @property() public appearance?: Appearance;

  protected render(): TemplateResult {
    return html`
      <div
        class=${classMap({
          container: true,
          vertical: this.appearance?.layout === "vertical",
        })}
      >
        ${this.appearance?.icon_type !== "none"
          ? html`
              <div class="icon">
                <slot name="icon"></slot>
                <slot name="badge"></slot>
              </div>
            `
          : nothing}
        ${this.appearance?.primary_info !== "none" ||
        this.appearance?.secondary_info !== "none"
          ? html`
              <div class="info">
                <slot name="info"></slot>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
        height: 100%;
      }
      .container {
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: var(--spacing);
        gap: var(--spacing);
      }
      .icon {
        position: relative;
      }
      .icon ::slotted(*[slot="badge"]) {
        position: absolute;
        top: -3px;
        right: -3px;
      }
      :host([rtl]) .icon ::slotted(*[slot="badge"]) {
        right: initial;
        left: -3px;
      }
      .info {
        min-width: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
      }
      .container.vertical {
        flex-direction: column;
      }
      .container.vertical .info {
        text-align: center;
      }
    `;
  }
}
