import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  TemplateResult,
} from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("mushroom-state-info")
export class StateItem extends LitElement {
  @property({ attribute: false }) public primary?: string | TemplateResult<1>;

  @property({ attribute: false }) public secondary?: string | TemplateResult<1>;

  @property({ type: Boolean }) public multiline_secondary?: boolean = false;

  protected render(): TemplateResult {
    return html`
      <div class="container">
        <span class="primary">${this.primary ?? ""}</span>
        ${this.secondary
          ? html`<span
              class="secondary${this.multiline_secondary
                ? ` multiline_secondary`
                : ``}"
              >${this.secondary}</span
            >`
          : nothing}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      .container {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .primary {
        font-weight: var(--card-primary-font-weight);
        font-size: var(--card-primary-font-size);
        line-height: var(--card-primary-line-height);
        color: var(--card-primary-color);
        letter-spacing: var(--card-primary-letter-spacing);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .secondary {
        font-weight: var(--card-secondary-font-weight);
        font-size: var(--card-secondary-font-size);
        line-height: var(--card-secondary-line-height);
        color: var(--card-secondary-color);
        letter-spacing: var(--card-secondary-letter-spacing);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .multiline_secondary {
        white-space: pre-wrap;
      }
    `;
  }
}
