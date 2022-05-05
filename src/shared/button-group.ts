import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("mushroom-button-group")
export class MushroomButtonGroup extends LitElement {
    @property() public fill: boolean = false;

    @property() public rtl: boolean = false;

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                <slot></slot>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex-direction: row;
                width: 100%;
            }
            .container {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            .container ::slotted(*:not(:last-child)) {
                margin-right: var(--spacing);
            }
            :host([rtl]) .container ::slotted(*:not(:last-child)) {
                margin-right: initial;
                margin-left: var(--spacing);
            }
            .container.fill > ::slotted(*) {
                flex: 1;
            }
        `;
    }
}
