import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { MODE_ICONS } from "../const";
import { compareClimateHvacModes } from "../utils";

@customElement("mushroom-thermostat-mode-control")
export class ThermostatModeControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property({ type: Boolean }) public fill: boolean = false;

    onClick(mode: string) {
        this.hass!.callService("climate", "set_hvac_mode", {
            entity_id: this.entity.entity_id,
            hvac_mode: mode,
        });
    }

    private _renderModeIcon(mode: string, currentMode: string): TemplateResult {
        if (!MODE_ICONS[mode]) {
            return html``;
        }
        const style = {};
        if (mode === currentMode) {
            style["--icon-color"] = `rgb(var(--rgb-state-climate-${mode}))`;
            style["--bg-color"] = `rgba(var(--rgb-state-climate-${mode}), 0.05)`;
        }
        return html`<mushroom-button
            style=${styleMap(style)}
            .icon=${MODE_ICONS[mode]}
            @click=${() => this.onClick(mode)}
        />`;
    }

    protected render(): TemplateResult {
        const currentMode = this.entity.state in MODE_ICONS ? this.entity.state : "unknown-mode";

        const { hvac_modes } = this.entity.attributes;

        return html`<div class=${classMap({ container: true, fill: this.fill })}>
            ${(hvac_modes || [])
                .sort(compareClimateHvacModes)
                .map((mode) => this._renderModeIcon(mode, currentMode))}
        </div>`;
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
            .container {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            .container.fill mushroom-button {
                flex: 1;
            }
        `;
    }
}
