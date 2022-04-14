import { computeRTL, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isActive, isAvailable } from "../../../ha/data/entity";
import { UpdateEntity, updateIsInstalling } from "../../../ha/data/update";
import "../../../shared/button";
import "../../../shared/button-group";

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
        if (!isAvailable(this.entity)) return true;
        const skippedVersion =
            this.entity.attributes.latest_version &&
            this.entity.attributes.skipped_version === this.entity.attributes.latest_version;
        return (!isActive(this.entity) && !skippedVersion) || updateIsInstalling(this.entity);
    }

    private get skipDisabled(): boolean {
        if (!isAvailable(this.entity)) return true;
        const skippedVersion =
            this.entity.attributes.latest_version &&
            this.entity.attributes.skipped_version === this.entity.attributes.latest_version;
        return skippedVersion || !isActive(this.entity) || updateIsInstalling(this.entity);
    }

    protected render(): TemplateResult {
        const rtl = computeRTL(this.hass);

        return html`
            <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
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
            </mushroom-button-group>
        `;
    }
}
