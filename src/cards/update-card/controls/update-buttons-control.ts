import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../../shared/button";
import { OFF, UNAVAILABLE } from "../../../utils/entity";
import { UpdateEntity, updateIsInstalling } from "../utils";

@customElement("mushroom-update-buttons-control")
export class UpdateButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: UpdateEntity;

    @property() public fill: boolean = false;

    private _handleInstall(): void {
        this.hass.callService("update", "install", {
            entity_id: this.entity.entity_id,
        });
    }

    private _handleSkip(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("update", "skip", {
            entity_id: this.entity.entity_id,
        });
    }

    private get installDisabled(): boolean {
        if (this.entity.state === UNAVAILABLE) return true;
        const skippedVersion =
            this.entity.attributes.latest_version &&
            this.entity.attributes.skipped_version === this.entity.attributes.latest_version;
        return (this.entity.state === OFF && !skippedVersion) || updateIsInstalling(this.entity);
    }

    private get skipDisabled(): boolean {
        if (this.entity.state === UNAVAILABLE) return true;
        const skippedVersion =
            this.entity.attributes.latest_version &&
            this.entity.attributes.skipped_version === this.entity.attributes.latest_version;
        return skippedVersion || this.entity.state === OFF || updateIsInstalling(this.entity);
    }

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                <mushroom-button
                    icon="mdi:cancel"
                    .disabled=${this.skipDisabled}
                    @click=${this._handleSkip}
                ></mushroom-button>
                <mushroom-button
                    icon="mdi:cellphone-arrow-down"
                    .disabled=${this.installDisabled}
                    @click=${this._handleInstall}
                ></mushroom-button>
            </div>
        `;
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
