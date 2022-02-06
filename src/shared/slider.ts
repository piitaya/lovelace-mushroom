import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

const getPercentageFromEvent = (
    e: TouchEvent | MouseEvent,
    element: HTMLElement
) => {
    const x = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const offset = element.getBoundingClientRect().left;
    const total = element.clientWidth;
    return Math.max(Math.min(1, (x - offset) / total), 0);
};

@customElement("mushroom-slider")
export class SliderItem extends LitElement {
    @property() public disabled: boolean = false;

    @property({ type: Boolean, attribute: "show-active" })
    public showActive?: boolean;

    @property({ type: Boolean, attribute: "show-indicator" })
    public showIndicator?: boolean;

    @property({ attribute: false, type: Number, reflect: true })
    public value?: number;

    @property({ type: Number })
    public min: number = 0;

    @property({ type: Number })
    public max: number = 100;

    valueToPercentage(value: number) {
        return (value - this.min) / (this.max - this.min);
    }

    percentageToValue(value: number) {
        return (this.max - this.min) * value + this.min;
    }

    onEvent = (touch: boolean) => (event: TouchEvent | MouseEvent) => {
        const [endEvent, moveEvent] = touch
            ? (["touchend", "touchmove"] as const)
            : (["mouseup", "mousemove"] as const);

        const element = event.currentTarget as HTMLDivElement;

        const onEnd = (e: TouchEvent | MouseEvent) => {
            const percentage = getPercentageFromEvent(e, element);
            this.value = this.percentageToValue(percentage);
            this.dispatchEvent(
                new CustomEvent("change", {
                    detail: {
                        value: Math.round(this.value),
                    },
                })
            );

            document.removeEventListener(endEvent, onEnd);
            document.removeEventListener(moveEvent, onMove);
        };

        const onMove = (e: TouchEvent | MouseEvent) => {
            const percentage = getPercentageFromEvent(e, element);
            this.value = this.percentageToValue(percentage);
        };

        document.addEventListener(endEvent, onEnd);
        document.addEventListener(moveEvent, onMove);
    };

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({ container: true, disabled: this.disabled })}
            >
                <div
                    class="slider"
                    @touchstart=${{
                        handleEvent: this.onEvent(true),
                        passive: true,
                    }}
                    @mousedown=${{
                        handleEvent: this.onEvent(false),
                        passive: true,
                    }}
                    style=${styleMap({
                        "--value": `${this.valueToPercentage(this.value ?? 0)}`,
                    })}
                >
                    <div class="slider-track-background"></div>
                    ${this.showActive
                        ? html`<div class="slider-track-active"></div>`
                        : null}
                    ${this.showIndicator
                        ? html`<div class="slider-track-indicator"></div>`
                        : null}
                </div>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --main-color: rgba(var(--rgb-secondary-text-color), 1);
                --bg-gradient: none;
                --bg-color: rgba(var(--rgb-secondary-text-color), 0.2);
                --main-color-disabled: var(--disabled-text-color);
                --bg-color-disabled: rgba(var(--rgb-primary-text-color), 0.05);
            }
            .container {
                display: flex;
                flex-direction: row;
                height: 42px;
            }
            .container > *:not(:last-child) {
                margin-right: var(--spacing);
            }
            .slider {
                position: relative;
                height: 100%;
                width: 100%;
                border-radius: var(--control-border-radius);
                transform: translateZ(0);
                overflow: hidden;
                cursor: pointer;
            }
            .slider * {
                pointer-events: none;
            }
            .slider .slider-track-background {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                background-color: var(--bg-color);
                background-image: var(--gradient);
            }
            .slider .slider-track-active {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                transform: scale3d(var(--value, 0), 1, 1);
                transform-origin: left;
                background-color: var(--main-color);
            }
            .slider .slider-track-active {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                transform: scale3d(var(--value, 0), 1, 1);
                transform-origin: left;
                background-color: var(--main-color);
            }
            .slider .slider-track-indicator {
                position: absolute;
                top: 0;
                bottom: 0;
                left: calc(var(--value, 0) * (100% - 10px));
                width: 10px;
                border-radius: 3px;
                background-color: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
            }
            .slider .slider-track-indicator:after {
                display: block;
                content: "";
                background-color: var(--main-color);
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                margin: auto;
                height: 20px;
                width: 2px;
                border-radius: 1px;
            }
            .disabled .slider .slider-track-background {
                background-color: var(--bg-color-disabled);
                background-image: none;
            }
            .disabled .slider .slider-track-indicator:after {
                background-color: var(--main-color-disabled);
            }
            .disabled .slider .slider-track-active {
                background-color: var(--main-color-disabled);
            }
        `;
    }
}
