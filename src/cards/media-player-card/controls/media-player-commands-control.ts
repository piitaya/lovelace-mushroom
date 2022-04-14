import { computeRTL, HomeAssistant } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MediaPlayerEntity } from "../../../ha/data/media-player";
import { MediaPlayerCommand } from "../media-player-card-config";
import { computeMediaControls, handleMediaControlClick } from "../utils";

export const isCommandsControlVisible = (
    entity: MediaPlayerEntity,
    commands: MediaPlayerCommand[]
) => computeMediaControls(entity, commands).length > 0;

@customElement("mushroom-media-player-commands-control")
export class MediaPlayerCommandsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: MediaPlayerEntity;

    @property({ attribute: false }) public commands!: MediaPlayerCommand[];

    @property() public fill: boolean = false;

    private _handleClick(e: MouseEvent): void {
        e.stopPropagation();
        const action = (e.target! as any).action as string;
        handleMediaControlClick(this.hass, this.entity, action!);
    }

    protected render(): TemplateResult {
        const rtl = computeRTL(this.hass);

        const controls = computeMediaControls(this.entity, this.commands);

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
