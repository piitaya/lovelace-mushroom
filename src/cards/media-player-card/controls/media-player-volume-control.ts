import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isAvailable } from "../../../ha/data/entity";
import { MediaPlayerEntity } from "../../../ha/data/media-player";
import { getVolumeLevel } from "../utils";

@customElement("mushroom-media-player-volume-control")
export class MediaPlayerVolumeControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: MediaPlayerEntity;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this.hass.callService("media_player", "volume_set", {
            entity_id: this.entity.entity_id,
            volume_level: value / 100,
        });
    }

    onCurrentChange(e: CustomEvent<{ value?: number }>): void {
        const value = (e.detail?.value || 1) / 100;
        this.dispatchEvent(
            new CustomEvent("current-change", {
                detail: {
                    value,
                },
            })
        );
    }

    protected render(): TemplateResult | null {
        if (!this.entity) return null;

        const value = getVolumeLevel(this.entity);
        return html`
            <mushroom-slider
                .value=${value}
                .disabled=${!isAvailable(this.entity)}
                .showActive=${true}
                .min=${0}
                .max=${100}
                @change=${this.onChange}
                @current-change=${this.onCurrentChange}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-slider {
                --main-color: rgb(var(--rgb-state-media-player));
                --bg-color: rgba(var(--rgb-state-media-player), 0.2);
            }
        `;
    }
}
