import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import "hammerjs";

const getPercentageFromEvent = (e: HammerInput) => {
  const x = e.center.x;
  const offset = e.target.getBoundingClientRect().left;
  const total = e.target.clientWidth;
  return Math.max(Math.min(1, (x - offset) / total), 0);
};

export const DEFAULT_SLIDER_THRESHOLD = 10;
const getSliderThreshold = (element: any): number | undefined => {
  const thresholdValue = window
    .getComputedStyle(element)
    .getPropertyValue("--slider-threshold");
  const threshold = parseFloat(thresholdValue);
  return isNaN(threshold) ? DEFAULT_SLIDER_THRESHOLD : threshold;
};

@customElement("mushroom-slider")
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

  @state() controlled: boolean = false;

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
        this.value =
          Math.round(this.percentageToValue(percentage) / this.step) *
          this.step;
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
        this.value =
          Math.round(this.percentageToValue(percentage) / this.step) *
          this.step;
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: {
              value: this.value,
            },
          })
        );
      });
    }
  }

  destroyListeners() {
    if (this._mc) {
      this._mc.destroy();
      this._mc = undefined;
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
          class="slider"
          style=${styleMap({
            "--value": `${this.valueToPercentage(this.value ?? 0)}`,
          })}
        >
          <div class="slider-track-background"></div>
          ${this.showActive
            ? html`<div class="slider-track-active"></div>`
            : nothing}
          ${this.showIndicator
            ? html`<div class="slider-track-indicator"></div>`
            : nothing}
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
        transition: transform 180ms ease-in-out;
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
        transition: left 180ms ease-in-out;
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
      .inactive .slider .slider-track-background {
        background-color: var(--bg-color-inactive);
        background-image: none;
      }
      .inactive .slider .slider-track-indicator:after {
        background-color: var(--main-color-inactive);
      }
      .inactive .slider .slider-track-active {
        background-color: var(--main-color-inactive);
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
