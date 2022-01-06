import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("mushroom-shape-icon")
export class ShapeIcon extends LitElement {
  @property() public icon: string = "";

  @property() public disabled: boolean = false;

  protected render(): TemplateResult {
    return html`
      <div class=${classMap({ container: true, disabled: this.disabled })}>
        <div class="icon-shape"></div>
        <ha-icon class="icon" .icon=${this.icon} />
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --main-color: var(--primary-text-color);
        --main-color-disabled: var(--disabled-text-color);
        --shape-color: rgba(var(--rgb-primary-text-color), 0.05);
        --shape-color-disabled: rgba(var(--rgb-primary-text-color), 0.05);
        flex: none;
      }
      .container {
        position: relative;
        width: 42px;
        height: 42px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-shape {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: var(--shape-color);
        transition: background-color 280ms ease-in-out;
      }
      .icon {
        --mdc-icon-size: 20px;
        color: var(--main-color);
        transition: color 280ms ease-in-out;
      }
      .disabled .icon-shape {
        background-color: var(--shape-color-disabled);
      }
      .disabled .icon {
        color: var(--main-color-disabled);
      }
    `;
  }
}
