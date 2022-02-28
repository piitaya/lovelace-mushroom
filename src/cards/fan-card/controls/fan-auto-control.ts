import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../../shared/slider";
import { isActive } from "../../../utils/entity";
import { isAuto, getPresetModes} from "../utils";

@customElement("mushroom-fan-auto-control")
export class FanPercentageControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    private _onTap(e: MouseEvent): void {
        e.stopPropagation();
        const auto = isAuto(this.entity);

        if (!auto) {
            const validAutoModes = ["auto", "smart", "woosh", "eco", "breeze"];
            getPresetModes(this.entity).every(presetMode => {
                if (validAutoModes.includes(presetMode.toLowerCase())) {
                    this.hass.callService("fan", "set_preset_mode", {
                        entity_id: this.entity.entity_id,
                        preset_mode: presetMode,
                    });
                    return false;
                } else {
                    return true;
                }
            });
        }
    };

    protected render(): TemplateResult {
        const auto = isAuto(this.entity);
        const active = isActive(this.entity);

        return html`
            <mushroom-button
                class=${classMap({ active: auto})}
                .icon=${"mdi:fan-auto"}
                @click=${this._onTap}
                .disabled=${!active}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
            }
            mushroom-button.active {
                --icon-color: rgb(var(--rgb-white));
                --bg-color: rgb(var(--rgb-state-fan));
            }
        `;
    }
}
