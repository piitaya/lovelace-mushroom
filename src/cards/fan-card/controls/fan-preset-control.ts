import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, isActive, isAvailable } from "../../../ha";
import "../../../shared/slider";
import { getPercentage } from "../utils";
import { FanCardConfig } from "../fan-card-config";
import { classMap } from "lit/directives/class-map.js";

@customElement("mushroom-fan-preset-control")
export class FanPresetControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;
    @property({ attribute: false }) public entity!: HassEntity;
    @property({ attribute: false }) public config!: FanCardConfig;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this.hass.callService("fan", "set_percentage", {
            entity_id: this.entity.entity_id,
            percentage: value,
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

    private _onTap(e: MouseEvent): void {
        e.stopPropagation();
        const value = this.config.presets?.find(f=>`fan-preset-${f.value}` === (e.target as Element).id)?.value;
        if(value === 0 || value) {
            this.hass.callService("fan", "set_percentage", {
                entity_id: this.entity.entity_id,
                percentage: value,
            });
    
            this.dispatchEvent(
                new CustomEvent("current-change", {
                    detail: {
                        value,
                    },
                })
            );
        }
    }

    protected render(): TemplateResult {
        const active = isActive(this.entity);
        const percentage = getPercentage(this.entity);

        return html`
            ${this.config.presets?.map(preset => {
            const activated = active && preset.value === percentage;
            return html`
                <mushroom-button
                    .disabled=${!isAvailable(this.entity)}
                    .icon=${preset.icon || "mdi:fan"}
                    @click=${this._onTap}
                     class=${classMap({ active: activated })}
                    .id=${'fan-preset-'+preset.value}
                />`
            })}
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
            }
            mushroom-button.active {
                --icon-color: rgb(var(--rgb-state-fan));
                --bg-color: rgba(var(--rgb-state-fan), 0.2);
            }
            mushroom-button {
                flex: 1
            }
            mushroom-button:not(:last-child) {
                margin-right: var(--spacing);
            }
        `;
    }
}
