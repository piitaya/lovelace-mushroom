import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { animations } from "../utils/entity-styles";

@customElement("mushroom-shape-icon")
export class ShapeIcon extends LitElement {
  @property({ type: Boolean }) public disabled?: boolean;

  protected render(): TemplateResult {
    return html`
      <div
        class=${classMap({
          shape: true,
          disabled: Boolean(this.disabled),
        })}
      >
        <slot></slot>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      // animations must be on this element for safari
      animations,
      css`
        :host {
          --icon-color: var(--primary-text-color);
          --icon-color-disabled: rgb(var(--rgb-disabled));
          --shape-color: rgba(var(--rgb-primary-text-color), 0.05);
          --shape-color-disabled: rgba(var(--rgb-disabled), 0.2);
          --shape-animation: none;
          --shape-outline-color: transparent;
          flex: none;
        }
        .shape {
          position: relative;
          width: var(--icon-size);
          height: var(--icon-size);
          font-size: var(--icon-size);
          border-radius: var(--icon-border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--shape-color);
          transition-property: background-color, box-shadow;
          transition-duration: 280ms;
          transition-timing-function: ease-out;
          animation: var(--shape-animation);
          box-shadow: 0 0 0 1px var(--shape-outline-color);
        }

        .shape ::slotted(*) {
          display: flex;
          color: var(--icon-color);
          transition: color 280ms ease-in-out;
        }
        ::slotted(ha-icon),
        ::slotted(ha-state-icon) {
          display: flex;
          line-height: 0;
          --mdc-icon-size: var(--icon-symbol-size);
        }
        .shape.disabled {
          background-color: var(--shape-color-disabled);
        }
        .shape.disabled ::slotted(*) {
          color: var(--icon-color-disabled);
        }
      `,
    ];
  }
}
