import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CoverEntity } from "../../../ha/data/cover";
import { isActive, isAvailable } from "../../../ha/data/entity";
import "../../../shared/slider";
import { getPosition } from "../utils";

@customElement("mushroom-cover-position-control")
export class CoverPositionControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: CoverEntity;

    private onChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;

        this.hass.callService("cover", "set_cover_position", {
            entity_id: this.entity.entity_id,
            position: value,
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
        const position = getPosition(this.entity);

        return html`
            <mushroom-slider
                .value=${position}
                .disabled=${!isAvailable(this.entity)}
                .inactive=${!isActive(this.entity)}
                .showActive=${true}
                @change=${this.onChange}
                @current-change=${this.onCurrentChange}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-slider {
                --main-color: rgb(var(--rgb-state-cover));
                --bg-color: rgba(var(--rgb-state-cover), 0.2);
            }
        `;
    }
}
