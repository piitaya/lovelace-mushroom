import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { LovelaceChip } from ".";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { BackChipConfig } from "../../../utils/lovelace/chip/types";
import { computeChipComponentName } from "../utils";

@customElement(computeChipComponentName("back"))
export class BackChip extends LitElement implements LovelaceChip {
    public static async getStubConfig(
        _hass: HomeAssistant
    ): Promise<BackChipConfig> {
        return {
            type: `back`,
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: BackChipConfig;

    public setConfig(config: BackChipConfig): void {
        this._config = config;
    }

    private _handleAction() {
        window.history.back();
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const icon = this._config.icon ?? "mdi:arrow-left";

        const iconStyle: { [name: string]: string } = {};
        if (this._config.icon_color) {
            iconStyle.color = this._config.icon_color;
        }

        return html`
            <mushroom-chip
                @action=${this._handleAction}
                .actionHandler=${actionHandler()}
            >
                <ha-icon .icon=${icon} style=${styleMap(iconStyle)}></ha-icon>
            </mushroom-chip>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-chip {
                cursor: pointer;
            }
        `;
    }
}
