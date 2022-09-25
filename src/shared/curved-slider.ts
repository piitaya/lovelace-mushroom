import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import "hammerjs";

enum CurvedSliderDirection {
    Normal = 'normal',
    Flipped = 'flipped', 
}

const getPercentageFromEvent = (e: HammerInput) => {
    const x = e.center.x;
    const offset = e.target.getBoundingClientRect().left;
    const total = e.target.clientWidth;
    return Math.max(Math.min(1, (x - offset) / total), 0);
};

export const DEFAULT_SLIDER_THRESHOLD = 10;
const getSliderThreshold = (element: any): number | undefined => {
    const thresholdValue = window.getComputedStyle(element).getPropertyValue("--slider-threshold");
    const threshold = parseFloat(thresholdValue);
    return isNaN(threshold) ? DEFAULT_SLIDER_THRESHOLD : threshold;
};

@customElement("mushroom-curved-slider")
export class SliderItem extends LitElement {
    @property({ type: Boolean }) public disabled: boolean = false;

    @property({ type: Boolean }) public inactive: boolean = false;

    @property({ type: Boolean, attribute: "show-active" })
    public showActive?: boolean;

    @property({ type: Boolean, attribute: "show-indicator" })
    public showIndicator?: boolean;

    @property({ attribute: false, type: Number, reflect: true })
    public value?: number;

    @property({ type: Number })
    public step: number = 1;

    @property({ type: Number })
    public min: number = 0;

    @property({ type: Number })
    public max: number = 100;

    private _mc?: HammerManager;

    private _ro?: ResizeObserver;

    @state() controlled: boolean = false;

    @state() initialized: boolean = false;

    valueToPercentage(value: number) {
        return (value - this.min) / (this.max - this.min);
    }

    percentageToValue(value: number) {
        return (this.max - this.min) * value + this.min;
    }

    protected firstUpdated(changedProperties: PropertyValues): void {
        super.firstUpdated(changedProperties);
        this.setupListeners();
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.setupListeners();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.destroyListeners();
    }

    @query("#slider")
    private slider;

    setupListeners() {
        if (this.slider && !this._mc) {
            const threshold = getSliderThreshold(this.slider);
            this._mc = new Hammer.Manager(this.slider, { touchAction: "pan-y" });
            this._mc.add(
                new Hammer.Pan({
                    threshold,
                    direction: Hammer.DIRECTION_ALL,
                    enable: true,
                })
            );

            this._mc.add(new Hammer.Tap({ event: "singletap" }));

            let savedValue;
            this._mc.on("panstart", () => {
                if (this.disabled) return;
                this.controlled = true;
                savedValue = this.value;
            });
            this._mc.on("pancancel", () => {
                if (this.disabled) return;
                this.controlled = false;
                this.value = savedValue;
            });
            this._mc.on("panmove", (e) => {
                if (this.disabled) return;
                const percentage = getPercentageFromEvent(e);
                this.value = this.percentageToValue(percentage);
                this.dispatchEvent(
                    new CustomEvent("current-change", {
                        detail: {
                            value: Math.round(this.value / this.step) * this.step,
                        },
                    })
                );
            });
            this._mc.on("panend", (e) => {
                if (this.disabled) return;
                this.controlled = false;
                const percentage = getPercentageFromEvent(e);
                // Prevent from input releasing on a value that doesn't lie on a step
                this.value = Math.round(this.percentageToValue(percentage) / this.step) * this.step;
                this.dispatchEvent(
                    new CustomEvent("current-change", {
                        detail: {
                            value: undefined,
                        },
                    })
                );
                this.dispatchEvent(
                    new CustomEvent("change", {
                        detail: {
                            value: this.value,
                        },
                    })
                );
            });

            this._mc.on("singletap", (e) => {
                if (this.disabled) return;
                const percentage = getPercentageFromEvent(e);
                // Prevent from input selecting a value that doesn't lie on a step
                this.value = Math.round(this.percentageToValue(percentage) / this.step) * this.step;
                this.dispatchEvent(
                    new CustomEvent("change", {
                        detail: {
                            value: this.value,
                        },
                    })
                );
            });
        }

        if (this.slider &&  !this._ro) {
            this._ro = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    let width;
                    let height;

                    if (entry.borderBoxSize?.length > 0) {
                        width = entry.borderBoxSize[0].inlineSize;
                        height = entry.borderBoxSize[0].blockSize;
                    } else {
                        width = entry.contentRect.width;
                        height = entry.contentRect.height;
                    }

                    const target = entry.target as HTMLElement;
                    this.updateCurvedSliderSVG(target, width, height);
                }
            });

            this._ro.observe(this.slider);
        }
    }

    destroyListeners() {
        if (this._mc) {
            this._mc.destroy();
            this._mc = undefined;
        }

        if (this._ro) {
            this._ro.disconnect();
            this._ro = undefined;
        }
    }

    updateCurvedSliderSVGOnValueChange() : void {
        this.updateCurvedSliderSVG(this.slider, this.slider.offsetWidth, this.slider.offsetHeight);
    }

    updateCurvedSliderSVG(target: HTMLElement, width: number, height: number) : void {

        const strokeThickness = parseFloat(getComputedStyle(target).getPropertyValue('--control-curved-slider-thickness'));

        const croppedWidth = width - strokeThickness;
        const croppedHeight = height - strokeThickness;
        const croppedWidthHalf = croppedWidth / 2;

        const circleRadius = ((croppedWidthHalf ** 2) + (croppedHeight ** 2)) / (2 * croppedHeight);

        const valuePositionX = (this.valueToPercentage(this.value ?? 0)) * croppedWidth - croppedWidthHalf;

        const indicator50Position = [
            croppedWidthHalf,
            0,
        ];

        const backgroundTrackArc = Math.asin(croppedWidthHalf / circleRadius) * 2;

        const activeValueRotation = Math.asin(-valuePositionX / circleRadius) - backgroundTrackArc / 2;
        const activeValueRotationCenter = [
            width / 2,
            strokeThickness / 2 + circleRadius
        ];
        const activeTrackRotation = (-activeValueRotation - backgroundTrackArc) / (2 * Math.PI) * 360.0;
        const indicatorRotation = (-activeValueRotation - backgroundTrackArc / 2) / (2 * Math.PI) * 360.0;
        
        const trackBackground= `
            M ${strokeThickness / 2} ${height - strokeThickness / 2}
            A ${circleRadius} ${circleRadius} 0 0 1 ${width - strokeThickness / 2} ${height - strokeThickness / 2}
        `;

        const svg = target.querySelector(':scope > svg');
        svg?.setAttribute('width', width.toString());
        svg?.setAttribute('height', height.toString());

        const sliderTrackBackground = svg?.querySelector(':scope .slider-track-background')
        sliderTrackBackground?.setAttribute('width', width.toString());
        sliderTrackBackground?.setAttribute('height', height.toString());

        const sliderTrackBackgroundMaskPath = svg?.querySelector(':scope #slider-track-background-mask path');
        sliderTrackBackgroundMaskPath?.setAttribute('d', trackBackground);

        const sliderTrackActive = svg?.querySelector(':scope .slider-track-active');
        sliderTrackActive?.setAttribute('d', trackBackground);
        sliderTrackActive?.setAttribute('transform', 
            `rotate(${activeTrackRotation} ${activeValueRotationCenter[0]} ${activeValueRotationCenter[1]})`);

        const sliderTrackIndicator = svg?.querySelector(':scope .slider-track-indicator');
        sliderTrackIndicator?.setAttribute('cx', (indicator50Position[0] + strokeThickness / 2).toString());
        sliderTrackIndicator?.setAttribute('cy', (indicator50Position[1] + + strokeThickness / 2).toString());
        sliderTrackIndicator?.setAttribute('transform', 
            `rotate(${indicatorRotation} ${activeValueRotationCenter[0]} ${activeValueRotationCenter[1]})`);
        
        this.initialized = true;
    }

    protected updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has("value")) {
          this.updateCurvedSliderSVGOnValueChange();
        }
      }

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    inactive: this.inactive || this.disabled,
                    controlled: this.controlled,
                })}
            >
                <div
                    id="slider"
                    class="slider curved-slider"
                    style=${styleMap({
                        "--value": `${this.valueToPercentage(this.value ?? 0)}`,
                    })}
                >
                    <svg style=${styleMap({
                        display: this.initialized ? 'inherit' : 'none',
                    })} >
                        <mask id="slider-track-background-mask">
                            <path class="slider-track" />
                        </mask>
                        <g class="slider-track-active-group" mask="url(#slider-track-background-mask)">
                            <rect class="slider-track-background" />
                            <path style=${styleMap({
                                visibility: this.showActive ? 'visible' : 'hidden',
                            })} class=${classMap({
                                'slider-track-active': true,
                                'slider-track': true,
                                'slider-track-active-initialized': this.initialized,
                            })} /></g>
                            <circle style=${styleMap({
                                visibility: this.showIndicator ? 'visible' : 'hidden',
                            })} class="slider-track-indicator" />
                    </svg>
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
                --main-color-inactive: rgb(var(--rgb-disabled));
                --bg-color-inactive: rgba(var(--rgb-disabled), 0.2);
            }
            .container {
                display: flex;
                flex-direction: row;
                height: var(--control-height);
            }
            .slider {
                position: relative;
                height: 100%;
                width: 100%;
                transform: translateZ(0);
                overflow: hidden;
                cursor: pointer;
            }
            .slider * {
                pointer-events: none;
            }
            .slider .slider-track {
                fill: transparent;
                stroke-width: var(--control-curved-slider-thickness);
                stroke-linecap: round;
            }
            .slider .slider-track-background {
                fill: var(--bg-color);
                background-image: var(--gradient);
            }
            .slider #slider-track-background-mask path {
                stroke: white;
            }
            .slider .slider-track-active {
                stroke: var(--main-color);
                transition: transform 180ms ease-in-out;
            }
            .slider .slider-track-indicator {
                r: calc(var(--control-curved-slider-thickness) / 2 - 1px);
                fill: white;
                filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12));
                transition: transform 180ms ease-in-out;
            }
            .inactive .slider .slider-track-background {
                fill: var(--bg-color-inactive);
            }
            .inactive .slider .slider-track-indicator {
                color: var(--main-color-inactive);
            }
            .inactive .slider .slider-track-active {
                stroke: var(--main-color-inactive);
            }
            .controlled .slider .slider-track-active {
                transition: none;
            }
            .controlled .slider .slider-track-indicator {
                transition: none;
            }
        `;
    }
}
