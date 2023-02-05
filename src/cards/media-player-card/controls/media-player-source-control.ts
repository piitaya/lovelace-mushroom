import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { computeRTL, HomeAssistant, MediaPlayerEntity } from "../../../ha";
import { styleMap } from "lit/directives/style-map.js";

@customElement("mushroom-media-player-source-control")
export class MediaPlayerSourceControls extends LitElement {
	@property({ attribute: false }) public hass!: HomeAssistant;

	@property({ attribute: false }) public entity!: MediaPlayerEntity;

	@property({ attribute: false }) public source!: string;

	@property({ attribute: false }) public icon!: string;

	@property() public fill: boolean = false;

	private _handleClick(e: MouseEvent): void {
		e.stopPropagation();

		this.hass.callService("media_player", "select_source", {
			entity_id: this.entity.entity_id,
			source: this.source
		});
	}

	protected render(): TemplateResult {
		const rtl = computeRTL(this.hass);
		const buttonStyle = {};
		if (this.entity.attributes.source == this.source) {
			buttonStyle["--bg-color"] = this.getSourceColor();
		}

		return html`
            <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
                <mushroom-button
                        .icon=${this.icon}
                        style=${styleMap(buttonStyle)}
                        @click=${this._handleClick}
                        title=${this.source}
                ></mushroom-button>
            </mushroom-button-group>
		`;
	}

	private getSourceColor(): string {
		return `rgb(var(--rgb-media-source-${this.source.toLowerCase()}, var(--rgb-state-media-player)))`;
	}
}
