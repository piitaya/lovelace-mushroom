import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { computeRTL, HomeAssistant, MediaPlayerEntity } from "../../../ha";
import { MediaPlayerMediaControl } from "../media-player-card-config";
import { computeMediaControls, handleMediaControlClick } from "../utils";

export const isMediaControlVisible = (
  entity: MediaPlayerEntity,
  controls?: MediaPlayerMediaControl[]
) => computeMediaControls(entity, controls ?? []).length > 0;

@customElement("mushroom-media-player-media-control")
export class MediaPlayerMediaControls extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: MediaPlayerEntity;

  @property({ attribute: false }) public controls!: MediaPlayerMediaControl[];

  @property({ type: Boolean }) public fill: boolean = false;

  private _handleClick(e: MouseEvent): void {
    e.stopPropagation();
    const action = (e.target! as any).action as string;
    handleMediaControlClick(this.hass, this.entity, action!);
  }

  protected render(): TemplateResult {
    const rtl = computeRTL(this.hass);

    const controls = computeMediaControls(this.entity, this.controls);

    return html`
      <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
        ${controls.map(
          (control) => html`
            <mushroom-button
              .action=${control.action}
              @click=${this._handleClick}
            >
              <ha-icon .icon=${control.icon}></ha-icon>
            </mushroom-button>
          `
        )}
      </mushroom-button-group>
    `;
  }
}
