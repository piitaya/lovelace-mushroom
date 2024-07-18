import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("mushroom-shape-avatar")
export class ShapePicture extends LitElement {
  @property() public picture_url: string = "";

  protected render(): TemplateResult {
    return html`
      <div class=${classMap({ container: true })}>
        <img class="picture" src=${this.picture_url} />
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --main-color: var(--primary-text-color);
        --icon-color-disabled: rgb(var(--rgb-disabled));
        --shape-color: rgba(var(--rgb-primary-text-color), 0.05);
        --shape-color-disabled: rgba(var(--rgb-disabled), 0.2);
        flex: none;
      }
      .container {
        position: relative;
        width: var(--icon-size);
        height: var(--icon-size);
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .picture {
        width: 100%;
        height: 100%;
        border-radius: var(--icon-border-radius);
      }
    `;
  }
}
