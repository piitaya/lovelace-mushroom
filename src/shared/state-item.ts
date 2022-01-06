import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "./shape-icon";

@customElement("mushroom-state-item")
export class StateItem extends LitElement {
  @property() public icon: string = "";

  @property() public name: string = "";

  @property() public value?: string;

  @property() public active: boolean = false;

  protected render(): TemplateResult {
    return html`
      <div class=${classMap({ container: true, active: this.active })}>
        <mushroom-shape-icon
          .disabled=${!this.active}
          .icon=${this.icon}
        ></mushroom-shape-icon>
        <div class="info-container">
          <span class="info-name">${this.name}</span>
          ${this.value
            ? html`<span class="info-value">${this.value}</span>`
            : null}
        </div>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      mushroom-shape-icon {
        --main-color: var(--icon-main-color);
        --shape-color: var(--icon-shape-color);
      }
      .container {
        display: flex;
        flex-direction: row;
      }
      .container > *:not(:last-child) {
        margin-right: 12px;
      }
      .info-container {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .info-name {
        font-weight: bold;
        font-size: 14px;
        color: var(--primary-text-color);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .info-value {
        font-weight: bolder;
        font-size: 12px;
        color: var(--secondary-text-color);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    `;
  }
}
