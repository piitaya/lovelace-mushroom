import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("mushroom-slider-item")
export class SliderItem extends LitElement {
  @property() public disabled: boolean = false;

  @property({ attribute: false, type: Number, reflect: true })
  public value?: number;

  cursorEventHandler = (touch: boolean) => (event: TouchEvent | MouseEvent) => {
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
      const value = getValue(e);
      this.value = value;
    };
    document.addEventListener(endEvent, onEnd);
    document.addEventListener(moveEvent, onMove);
  };

  protected render(): TemplateResult {
    return html`
      <div class=${classMap({ container: true, disabled: this.disabled })}>
        <div
          class="slider"
          @touchstart=${this.cursorEventHandler(true)}
          @mousedown=${this.cursorEventHandler(false)}
          style=${styleMap({
            "--value": `${(this.value ?? 0) / 100}`,
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
        --main-color: rgba(var(--rgb-primary-color), 1);
        --main-color-disabled: var(--disabled-text-color);
        --bg-color: rgba(var(--rgb-primary-color), 0.2);
        --bg-color-disabled: rgba(var(--rgb-primary-text-color), 0.05);
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
        cursor: pointer;
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
        background-color: var(--bg-color);
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
      .disabled .slider .slider-track {
        background-color: var(--bg-color-disabled);
      }
      .disabled .slider .slider-track-active {
        background-color: var(--main-color-disabled);
      }
    `;
  }
}
