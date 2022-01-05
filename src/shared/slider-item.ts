import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("mushroom-slider-item")
export class SliderItem extends LitElement {
  @property() public active: boolean = false;

  @property({ attribute: false, type: Number, reflect: true })
  public value?: number;

  cursorEventHandler = (touch: boolean) => (event: TouchEvent | MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const [endEvent, moveEvent] = touch
      ? ["touchend", "touchmove"]
      : ["mouseup", "mousemove"];

    const element = event.currentTarget as HTMLDivElement;
    const offset = element.getBoundingClientRect().left;

    const getValue = (e: TouchEvent | MouseEvent) => {
      const x = touch
        ? (e as TouchEvent).changedTouches[0].clientX
        : (e as MouseEvent).clientX;
      return Math.min(
        Math.max(((x - offset) * 100) / element.clientWidth, 0),
        100
      );
    };

    const onEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const value = getValue(e);
      this.value = value;
      let changeEvent = new CustomEvent("change", {
        detail: {
          value: Math.round(value),
        },
      });
      this.dispatchEvent(changeEvent);
      document.removeEventListener(endEvent, onEnd);
      document.removeEventListener(moveEvent, onMove);
    };

    const onMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const value = getValue(e);
      this.value = value;
    };
    document.addEventListener(endEvent, onEnd);
    document.addEventListener(moveEvent, onMove);
  };

  protected render(): TemplateResult {
    return html`
      <div class=${classMap({ container: true, active: this.active })}>
        <div
          class="slider"
          @touchstart=${this.cursorEventHandler(true)}
          @mousedown=${this.cursorEventHandler(false)}
          @click=${(e) => e.stopPropagation()}
          style=${styleMap({
            "--slider-value": `${(this.value ?? 0) / 100}`,
          })}
        >
          <div class="slider-track"></div>
          <div class="slider-track-active"></div>
        </div>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --color-default: var(--disabled-text-color);
        --color-active: var(--primary-color);
      }
      .container {
        display: flex;
        flex-direction: row;
        height: 42px;
      }
      .container > *:not(:last-child) {
        margin-right: 12px;
      }
      .slider {
        position: relative;
        height: 100%;
        width: 100%;
        border-radius: 12px;
        transform: translateZ(0);
        overflow: hidden;
      }
      .slider * {
        pointer-events: none;
      }
      .slider .slider-track {
        position: relative;
        height: 42px;
        width: 100%;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: var(--color-default);
        opacity: 0.2;
        transition: background-color 280ms ease-in-out;
      }
      .active .slider .slider-track {
        background-color: var(--color-active);
      }
      .slider .slider-track-active {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        transform: scale3d(var(--slider-value, 0), 1, 1);
        transform-origin: left;
        background-color: var(--color-default);
        opacity: 0.5;
        transition: background-color 280ms ease-in-out,
          opacity 280ms ease-in-out;
      }
      .active .slider .slider-track-active {
        background-color: var(--color-active);
        opacity: 1;
      }
    `;
  }
}
