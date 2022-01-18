import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import "./shape-icon";

@customElement("mushroom-state-item")
export class StateItem extends LitElement {
    @property() public icon: string = "";

    @property() public name: string = "";

    @property() public value?: string;

    @property() public active: boolean = false;

    @property() public badge_icon?: string;

    @property() public shape_pulse?: boolean;

    protected render(): TemplateResult {
        return html`
            <div class=${classMap({ container: true, active: this.active })}>
                <div class="icon-container">
                    <mushroom-shape-icon
                        .disabled=${!this.active}
                        .icon=${this.icon}
                        .pulse=${!!this.shape_pulse}
                    >
                    </mushroom-shape-icon>
                    ${this.badge_icon
                        ? html`<mushroom-badge-icon
                              .icon=${this.badge_icon}
                          ></mushroom-badge-icon>`
                        : ""}
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
            mushroom-shape-icon {
                --main-color: var(--icon-main-color);
                --shape-color: var(--icon-shape-color);
            }
            mushroom-badge-icon {
                --main-color: var(--badge-main-color);
                --shape-color: var(--badge-shape-color);
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
            }
            mushroom-badge-icon {
                position: absolute;
                top: -3px;
                right: -3px;
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
