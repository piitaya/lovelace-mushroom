import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  TemplateResult,
} from "lit";
import { property, customElement } from "lit/decorators.js";
import { animations } from "../utils/entity-styles";

@customElement("mushroom-chip")
export class Chip extends LitElement {
  @property() public icon: string = "";

  @property() public label: string = "";

  @property() public avatar: string = "";

  @property() public avatarOnly: boolean = false;

  protected render(): TemplateResult {
    return html`
      <ha-card>
        ${this.avatar
          ? html` <img class="avatar" src=${this.avatar} /> `
          : nothing}
        ${!this.avatarOnly
          ? html`
              <div class="content">
                <slot></slot>
              </div>
            `
          : nothing}
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      // animations must be on this element for safari
      animations,
      css`
        :host {
          --icon-color: var(--primary-text-color);
          --text-color: var(--primary-text-color);
        }
        ha-card {
          box-sizing: border-box;
          height: var(--chip-height);
          min-width: var(--chip-height);
          font-size: var(--chip-height);
          width: auto;
          border-radius: var(--chip-border-radius);
          display: flex;
          flex-direction: row;
          align-items: center;
          background: var(--chip-background);
          border-width: var(--chip-border-width);
          border-color: var(--chip-border-color);
          box-shadow: var(--chip-box-shadow);
          box-sizing: content-box;
        }
        .avatar {
          --avatar-size: calc(
            var(--chip-height) - 2 * var(--chip-avatar-padding)
          );
          border-radius: var(--chip-avatar-border-radius);
          height: var(--avatar-size);
          width: var(--avatar-size);
          margin-left: var(--chip-avatar-padding);
          box-sizing: border-box;
          object-fit: cover;
        }
        :host([rtl]) .avatar {
          margin-left: initial;
          margin-right: var(--chip-avatar-padding);
        }
        .content {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: var(--chip-padding);
          line-height: 0;
        }
        ::slotted(ha-icon),
        ::slotted(ha-state-icon) {
          display: flex;
          line-height: 0;
          --mdc-icon-size: var(--chip-icon-size);
          color: var(--icon-color);
        }
        ::slotted(svg) {
          width: var(--chip-icon-size);
          height: var(--chip-icon-size);
          display: flex;
        }
        ::slotted(span) {
          font-weight: var(--chip-font-weight);
          font-size: var(--chip-font-size);
          line-height: 1;
          color: var(--text-color);
        }
        ::slotted(*:not(:last-child)) {
          margin-right: 0.15em;
        }
        :host([rtl]) ::slotted(*:not(:last-child)) {
          margin-right: initial;
          margin-left: 0.15em;
        }
      `,
    ];
  }
}
