import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  TemplateResult,
  unsafeCSS,
} from "lit";
import { customElement, property } from "lit/decorators.js";
import { CoverEntity, HomeAssistant, isAvailable } from "../../../ha";
import "../../../shared/slider";
import { getTiltPosition } from "../utils";

function createTiltSliderTrackBackgroundGradient(
  count: number = 24,
  minStrokeWidth: number = 0.2
) {
  const gradient: [number, string][] = [];

  for (let i = 0; i < count; i++) {
    const stopOffset1 = i / count;
    const stopOffset2 =
      stopOffset1 +
      (i / count ** 2) * (1 - minStrokeWidth) +
      minStrokeWidth / count;

    if (i !== 0) {
      gradient.push([stopOffset1, "transparent"]);
    }
    gradient.push([stopOffset1, "var(--slider-bg-color)"]);
    gradient.push([stopOffset2, "var(--slider-bg-color)"]);
    gradient.push([stopOffset2, "transparent"]);
  }

  return gradient;
}

const GRADIENT = createTiltSliderTrackBackgroundGradient();

@customElement("mushroom-cover-tilt-position-control")
export class CoverTiltPositionControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: CoverEntity;

  private onChange(e: CustomEvent<{ value: number }>): void {
    const value = e.detail.value;

    this.hass.callService("cover", "set_cover_tilt_position", {
      entity_id: this.entity.entity_id,
      tilt_position: value,
    });
  }

  onCurrentChange(e: CustomEvent<{ value?: number }>): void {
    const value = e.detail.value;
    this.dispatchEvent(
      new CustomEvent("current-change", {
        detail: {
          value,
        },
      })
    );
  }

  protected render(): TemplateResult {
    const tilt = getTiltPosition(this.entity);

    return html`
      <mushroom-slider
        .value=${tilt}
        .disabled=${!isAvailable(this.entity)}
        .showIndicator=${true}
        @change=${this.onChange}
        @current-change=${this.onCurrentChange}
      />
    `;
  }

  static get styles(): CSSResultGroup {
    const gradient = GRADIENT.map(
      ([stop, color]) => `${color} ${(stop as number) * 100}%`
    ).join(", ");
    return css`
      mushroom-slider {
        --main-color: var(--slider-color);
        --bg-color: var(--slider-bg-color);
        --gradient: -webkit-linear-gradient(right, ${unsafeCSS(gradient)});
      }
    `;
  }
}
