import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("mui-state-item")
export class StateItem extends LitElement {
  @property() public icon: string = "";

  @property() public name: string = "";

  @property() public value?: string;

  @property() public active: boolean = false;

  protected render(): TemplateResult {
    return html`
      <div class=${classMap({ container: true, active: this.active })}>
        <div class="icon-container">
          <div class="icon-circle">
            <ha-icon class="icon" .icon=${this.icon} />
          </div>
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
        --color-theme: 51, 51, 51;
        --color-active: 51, 51, 51;
        --color-text: 33, 33, 33;
      }
      .container {
        display: flex;
        flex-direction: row;
        padding: 12px;
      }
      .container > *:not(:last-child) {
        margin-right: 12px;
      }
      .icon-container {
        width: 42px;
        height: 42px;
        flex: none;
      }
      .icon-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(var(--color-theme), 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 280ms ease-in-out;
      }
      .active .icon-circle {
        background-color: rgba(var(--color-active), 0.2);
      }
      .icon {
        color: rgba(var(--color-theme), 0.2);
        --mdc-icon-size: 20px;
        transition: color 280ms ease-in-out;
      }
      .active .icon {
        color: rgba(var(--color-active), 1);
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
        color: rgba(var(--color-text), 1);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .info-value {
        font-weight: bolder;
        font-size: 12px;
        color: rgba(var(--color-text), 0.4);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    `;
  }
}
