import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CoverEntity, HomeAssistant, isAvailable } from "../../../ha";
import "../../../shared/curved-slider";
import { getTiltPosition } from "../utils";

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
            <mushroom-curved-slider
                .value=${tilt}
                .disabled=${!isAvailable(this.entity)}
                .showActive=${true}
                @change=${this.onChange}
                @current-change=${this.onCurrentChange}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-curved-slider {
                --main-color: var(--slider-color);
                --bg-color: var(--slider-bg-color);
            }
        `;
    }
}
