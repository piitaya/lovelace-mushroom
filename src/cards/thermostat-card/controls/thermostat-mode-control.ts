import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ClimateEntity, compareClimateHvacModes } from "../../../ha/data/climate";
import { climateIcon } from "../../../utils/icons/climate-icon";
import "../../../shared/button";
import "../../../shared/button-group";

@customElement("mushroom-thermostat-mode-control")
export class ThermostatModeControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: ClimateEntity;

    @property({ type: Boolean }) public fill: boolean = false;

    onClick(mode: string) {
        this.hass!.callService("climate", "set_hvac_mode", {
            entity_id: this.entity.entity_id,
            hvac_mode: mode,
        });
    }

    private _renderModeIcon(mode: string): TemplateResult {
        const state = this.entity.state;

        const style = {};
        if (mode === state) {
            style["--icon-color"] = `rgb(var(--rgb-state-climate-${mode}))`;
            style["--bg-color"] = `rgba(var(--rgb-state-climate-${mode}), 0.05)`;
        }
        return html`<mushroom-button
            style=${styleMap(style)}
            .icon=${climateIcon(mode)}
            @click=${() => this.onClick(mode)}
        />`;
    }

    protected render(): TemplateResult {
        const { hvac_modes } = this.entity.attributes;

        return html`<mushroom-button-group .fill=${this.fill}>
            ${(hvac_modes || [])
                .sort(compareClimateHvacModes)
                .map((mode) => this._renderModeIcon(mode))}
        </mushroom-button-group>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex-direction: row;
                width: 100%;
            }
            :host *:not(:last-child) {
                margin-right: var(--spacing);
            }
        `;
    }
}
