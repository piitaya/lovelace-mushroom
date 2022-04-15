import { computeRTL, HomeAssistant } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MediaPlayerEntity } from "../../../ha/data/media-player";
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

    @property() public fill: boolean = false;

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
                            .icon=${control.icon}
                            .action=${control.action}
                            @click=${this._handleClick}
                        ></mushroom-button>
                    `
                )}
            </mushroom-button-group>
        `;
    }
}
