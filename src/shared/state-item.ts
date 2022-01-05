import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("mushroom-state-item")
export class StateItem extends LitElement {
  @property() public icon: string = "";

  @property() public name: string = "";

  @property() public value?: string;

  @property() public active: boolean = false;

  protected render(): TemplateResult {
    return html`
      <div class=${classMap({ container: true, active: this.active })}>
        <div class="icon-container">
          <div class="icon-circle"></div>
          <ha-icon class="icon" .icon=${this.icon} />
        </div>
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
      :host {
        --color-default: var(--disabled-text-color);
        --color-active: var(--primary-color);
      }
      .container {
        display: flex;
        flex-direction: row;
      }
      .container > *:not(:last-child) {
        margin-right: 12px;
      }
      .icon-container {
        position: relative;
        width: 42px;
        height: 42px;
        flex: none;
        display: flex;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: var(--color-default);
        opacity: 0.2;
        transition-property: background-color;
        transition-duration: 280ms;
        transition-timing-function: ease-in-out;
      }
      .active .icon-circle {
        background-color: var(--color-active);
      }
      .icon {
        --mdc-icon-size: 20px;
        color: var(--color-default);
        transition-property: color;
        transition-duration: 280ms;
        transition-timing-function: ease-in-out;
      }
      .active .icon {
        color: var(--color-active);
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
