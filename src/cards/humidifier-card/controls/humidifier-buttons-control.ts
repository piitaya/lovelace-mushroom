import { computeRTL, HomeAssistant } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isAvailable } from "../../../ha/data/entity";
import { HumidifierEntity, HUMIDIFIER_STATE_OFF, HUMIDIFIER_STATE_ON } from "../../../ha/data/humidifier";
import setupCustomlocalize from "../../../localize";

interface HumidifierButton {
    icon: string;
    title?: string;
    serviceName?: string;
    isVisible: (entity: HumidifierEntity) => boolean;
    isDisabled: (entity: HumidifierEntity) => boolean;
}

export const HUMIDIFIER_BUTTONS: HumidifierButton[] = [
    {
        icon: "mdi:air-humidifier",
        title: "on",
        serviceName: "turn_on",
        isVisible: (entity) => entity.state === HUMIDIFIER_STATE_OFF,
        isDisabled: () => false,
    },
    {
        icon: "mdi:air-humidifier-off",
        title: "off",
        serviceName: "turn_off",
        isVisible: (entity) => entity.state === HUMIDIFIER_STATE_ON,
        isDisabled: () => false,
    },
];

@customElement("mushroom-humidifier-buttons-control")
export class HumidifierButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HumidifierEntity;

    @property({ attribute: false }) public fill: boolean = false;

    private callService(e: CustomEvent) {
        e.stopPropagation();
        const entry = (e.target! as any).entry as HumidifierButton;
        this.hass.callService("humidifier", entry.serviceName!, {
            entity_id: this.entity!.entity_id,
        });
    }

    protected render(): TemplateResult {
        const rtl = computeRTL(this.hass);
        const customLocalize = setupCustomlocalize(this.hass!);

        return html`
            <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}
                >${HUMIDIFIER_BUTTONS.filter((item) => item.isVisible(this.entity)).map(
                    (item) => html`
                        <mushroom-button
                            .icon=${item.icon}
                            .entry=${item}
                            .title=${item.title
                                ? customLocalize(`editor.card.humidifier.${item.title}`)
                                : ""}
                            .disabled=${!isAvailable(this.entity) || item.isDisabled(this.entity)}
                            @click=${this.callService}
                        ></mushroom-button>
                    `
                )}</mushroom-button-group
            >
        `;
    }
}
