import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import {
  conditionalClamp,
  debounce,
  formatNumber,
  FrontendLocaleData,
  round,
} from "../ha";

const DEFAULT_STEP = 1;
const DEFAULT_DEBOUCE_TIME = 2000;

const getInputNumberDebounceTime = (element: any): number => {
  const debounceTimeValue = window
    .getComputedStyle(element)
    .getPropertyValue("--input-number-debounce");
  const debounceTime = parseFloat(debounceTimeValue);
  return isNaN(debounceTime) ? DEFAULT_DEBOUCE_TIME : debounceTime;
};

@customElement("mushroom-input-number")
export class InputNumber extends LitElement {
  @property({ attribute: false }) public locale!: FrontendLocaleData;

  @property({ type: Boolean }) public disabled: boolean = false;

  @property({ attribute: false, type: Number, reflect: true })
  public value?: number;

  @property({ type: Number })
  public step?: number;

  @property({ type: Number })
  public min?: number;

  @property({ type: Number })
  public max?: number;

  @property({ attribute: false })
  public formatOptions: Intl.NumberFormatOptions = {};

  @state() pending = false;

  private get _precision() {
    return Math.ceil(Math.log10(1 / this._step));
  }

  private get _step() {
    return this.step ?? DEFAULT_STEP;
  }

  private _incrementValue(e: MouseEvent) {
    e.stopPropagation();
    if (this.value == null) return;
    const value = round(this.value + this._step, this._precision);
    this._processNewValue(value);
  }

  private _decrementValue(e: MouseEvent) {
    e.stopPropagation();
    if (this.value == null) return;
    const value = round(this.value - this._step, this._precision);
    this._processNewValue(value);
  }

  @query("#container")
  private container;

  private dispatchValue = (value: number) => {
    this.pending = false;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          value,
        },
      })
    );
  };

  private debounceDispatchValue = this.dispatchValue;

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    const debounceTime = getInputNumberDebounceTime(this.container);
    if (debounceTime) {
      this.debounceDispatchValue = debounce(this.dispatchValue, debounceTime);
    }
  }

  private _processNewValue(value) {
    const newValue = conditionalClamp(value, this.min, this.max);
    if (this.value !== newValue) {
      this.value = newValue;
      this.pending = true;
    }
    this.debounceDispatchValue(newValue);
  }

  protected render(): TemplateResult {
    const value =
      this.value != null
        ? formatNumber(this.value, this.locale, this.formatOptions)
        : "-";

    return html`
      <div class="container" id="container">
        <button
          class="button minus"
          @click=${this._decrementValue}
          .disabled=${this.disabled}
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <span
          class=${classMap({
            value: true,
            pending: this.pending,
            disabled: this.disabled,
          })}
        >
          ${value}
        </span>
        <button
          class="button plus"
          @click=${this._incrementValue}
          .disabled=${this.disabled}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --text-color: var(--primary-text-color);
        --text-color-disabled: rgb(var(--rgb-disabled));
        --icon-color: var(--primary-text-color);
        --icon-color-disabled: rgb(var(--rgb-disabled));
        --bg-color: rgba(var(--rgb-primary-text-color), 0.05);
        --bg-color-disabled: rgba(var(--rgb-disabled), 0.2);
        height: var(--control-height);
        width: calc(var(--control-height) * var(--control-button-ratio) * 3);
        flex: none;
      }
      .container {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 6px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        border-radius: var(--control-border-radius);
        border: none;
        background-color: var(--bg-color);
        transition: background-color 280ms ease-in-out;
        height: var(--control-height);
        overflow: hidden;
      }
      .button {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: var(--control-border-radius);
        line-height: 0;
        height: 100%;
      }
      .minus {
        padding-right: 0;
      }
      .plus {
        padding-left: 0;
      }
      .button:disabled {
        cursor: not-allowed;
      }
      .button ha-icon {
        font-size: var(--control-height);
        --mdc-icon-size: var(--control-icon-size);
        color: var(--icon-color);
        pointer-events: none;
      }
      .button:disabled ha-icon {
        color: var(--icon-color-disabled);
      }
      .value {
        text-align: center;
        flex-grow: 1;
        flex-shrink: 0;
        flex-basis: 20px;
        font-weight: bold;
        color: var(--text-color);
      }
      .value.disabled {
        color: var(--text-color-disabled);
      }
      .value.pending {
        opacity: 0.5;
      }
    `;
  }
}
