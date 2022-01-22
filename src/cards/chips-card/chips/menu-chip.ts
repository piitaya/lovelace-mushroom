import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { LovelaceChip } from ".";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { computeChipComponentName } from "../utils";

export type MenuChipConfig = {
    type: "menu";
    icon?: string;
    icon_color?: string;
};

@customElement(computeChipComponentName("menu"))
export class MenuChip extends LitElement implements LovelaceChip {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: MenuChipConfig;

    public setConfig(config: MenuChipConfig): void {
        this._config = config;
    }

    private _handleAction() {
        fireEvent(this, "hass-toggle-menu" as any);
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const icon = this._config.icon ?? "mdi:menu";

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
