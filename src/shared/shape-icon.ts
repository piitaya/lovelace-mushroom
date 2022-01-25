import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("mushroom-shape-icon")
export class ShapeIcon extends LitElement {
    @property() public icon: string = "";

    @property() public disabled: boolean = false;

    @property() public pulse: boolean = false;

    @property() public spin: boolean = false;

    @property() public spin_animation_duration?: string;

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    shape: true,
                    disabled: this.disabled,
                    pulse: this.pulse,
                    spin: this.spin,
                })}
                style=${styleMap({
                    "--spin_animation_duration": this.spin_animation_duration,
                })}
            >
                <ha-icon .icon=${this.icon} />
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --main-color: var(--primary-text-color);
                --main-color-disabled: var(--disabled-text-color);
                --shape-color: rgba(var(--rgb-primary-text-color), 0.05);
                --shape-color-disabled: rgba(
                    var(--rgb-primary-text-color),
                    0.05
                );
                --spin_animation_duration: 1s;
                flex: none;
            }
            .shape {
                position: relative;
                width: 42px;
                height: 42px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: var(--shape-color);
                transition: background-color 280ms ease-in-out;
            }
            .shape ha-icon {
                display: flex;
                --mdc-icon-size: 20px;
                color: var(--main-color);
                transition: color 280ms ease-in-out;
            }
            .shape.disabled {
                background-color: var(--shape-color-disabled);
            }
            .shape.disabled ha-icon {
                color: var(--main-color-disabled);
            }
            .shape.pulse {
                animation: 1s ease 0s infinite normal none running pulse;
            }
            .shape.spin ha-icon {
                animation-duration: var(--spin_animation_duration);
                animation-name: spin;
                animation-iteration-count: infinite;
                animation-timing-function: linear;
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
