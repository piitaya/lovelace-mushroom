import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("mushroom-shape-icon")
export class ShapeIcon extends LitElement {
    @property() public icon: string = "";

    @property() public disabled: boolean = false;

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    shape: true,
                    disabled: this.disabled,
                })}
            >
                <ha-icon .icon=${this.icon} />
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --icon-color: var(--primary-text-color);
                --icon-color-disabled: var(--disabled-text-color);
                --icon-animation: none;
                --shape-color: rgba(var(--rgb-primary-text-color), 0.05);
                --shape-color-disabled: rgba(
                    var(--rgb-primary-text-color),
                    0.05
                );
                --shape-animation: none;
                flex: none;
            }
            .shape {
                position: relative;
                width: 42px;
                height: 42px;
                border-radius: var(--icon-border-radius);
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: var(--shape-color);
                transition: background-color 280ms ease-in-out;
                animation: var(--shape-animation);
            }
            .shape ha-icon {
                display: flex;
                --mdc-icon-size: 20px;
                color: var(--icon-color);
                transition: color 280ms ease-in-out;
                animation: var(--icon-animation);
            }
            .shape.disabled {
                background-color: var(--shape-color-disabled);
            }
            .shape.disabled ha-icon {
                color: var(--icon-color-disabled);
            }
            @keyframes pulse {
                0% {
                    opacity: 1;
                }
                50% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
        `;
    }
}
