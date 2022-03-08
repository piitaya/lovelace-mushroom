import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("mushroom-state-info")
export class StateItem extends LitElement {
    @property() public primary: string = "";

    @property() public secondary?: string;

    @property() public attribute?: string;

    @property() public multiline_secondary?: boolean = false;

    protected render(): TemplateResult {

        if (this.attribute) {
            return html`
            <div class="container">
                <span class="primary">${this.primary}</span>
                <span>
                
                ${this.secondary
                    ? html`<span
                          class="secondary${this.multiline_secondary ? ` multiline_secondary` : ``} pull-left"
                          >${this.secondary}</span
                      >`
                    : null}

                ${this.attribute
                    ? html`<span
                            class="attribute pull-right"
                            >${this.attribute}</span
                        >`
                    : null}
                </span>
            </div>
        `;
        }
        else {
            return html`
            <div class="container">
                <span class="primary">${this.primary}</span>
                
                ${this.secondary
                    ? html`<span
                          class="secondary${this.multiline_secondary ? ` multiline_secondary` : ``}"
                          >${this.secondary}</span
                      >`
                    : null}
        `;
        }
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
                font-weight: bold;
                font-size: 14px;
                color: var(--primary-text-color);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .secondary {
                font-weight: bolder;
                font-size: 12px;
                color: var(--secondary-text-color);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .attribute {
                font-weight: bolder;
                font-size: 12px;
                color: var(--secondary-text-color);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .multiline_secondary {
                white-space: pre-wrap;
            }
            .pull-left{
                float:left;
            }
            .pull-right{
                float:right;
            }
        `;
    }
}
