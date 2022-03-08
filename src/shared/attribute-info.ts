import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("mushroom-attribute-info")
export class AttributeItem extends LitElement {
    @property() public primary: string = "";

    @property() public primary_attribute?: string;

    @property() public secondary_attribute?: string;

    @property() public multiline_secondary?: boolean = false;

    protected render(): TemplateResult {

        if (this.secondary_attribute) {
            return html`
            <div class="container">
                <span class="primary">${this.primary}</span>
                <span>
                
                ${this.primary_attribute
                    ? html`<span
                          class="primary_attribute pull-left"
                          >${this.primary_attribute}</span
                      >`
                    : null}

                ${this.secondary_attribute
                    ? html`<span
                            class="secondary_attribute pull-right"
                            >${this.secondary_attribute}</span
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
                
                ${this.primary_attribute
                    ? html`<span
                          class="primary_attribute"
                          >${this.primary_attribute}</span
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
            .primary-attribute {
                font-weight: bolder;
                font-size: 12px;
                color: var(--secondary-text-color);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .secondary-attribute {
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
