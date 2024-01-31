import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
    computeRTL,
    HomeAssistant,
    isActive,
    isAvailable,
    supportsFeature,
    VacuumEntity,
    VACUUM_SUPPORT_CLEAN_SPOT,
    VACUUM_SUPPORT_LOCATE,
    VACUUM_SUPPORT_PAUSE,
    VACUUM_SUPPORT_RETURN_HOME,
    VACUUM_SUPPORT_START,
    VACUUM_SUPPORT_STOP,
    VACUUM_SUPPORT_TURN_OFF,
    VACUUM_SUPPORT_TURN_ON,
} from "../../../ha";
import { isCleaning, isReturningHome, isStopped } from "../utils";
import { VacuumCommand } from "../vacuum-card-config";

interface VacuumButton {
    icon: string;
    serviceName: string;
    isVisible: (entity: VacuumEntity, commands: VacuumCommand[]) => boolean;
    isDisabled: (entity: VacuumEntity) => boolean;
}

export const isCommandsControlVisible = (entity: VacuumEntity, commands: VacuumCommand[]) =>
    VACUUM_BUTTONS.some((item) => item.isVisible(entity, commands));

export const VACUUM_BUTTONS: VacuumButton[] = [
    {
        icon: "mdi:power",
        serviceName: "turn_on",
        isVisible: (entity, commands) =>
            supportsFeature(entity, VACUUM_SUPPORT_TURN_ON) &&
            commands.includes("on_off") &&
            !isActive(entity),
        isDisabled: () => false,
    },
    {
        icon: "mdi:power",
        serviceName: "turn_off",
        isVisible: (entity, commands) =>
            supportsFeature(entity, VACUUM_SUPPORT_TURN_OFF) &&
            commands.includes("on_off") &&
            isActive(entity),
        isDisabled: () => false,
    },
    {
        icon: "mdi:play",
        serviceName: "start",
        isVisible: (entity, commands) =>
            supportsFeature(entity, VACUUM_SUPPORT_START) &&
            commands.includes("start_pause") &&
            !isCleaning(entity),
        isDisabled: () => false,
    },
    {
        icon: "mdi:pause",
        serviceName: "pause",
        isVisible: (entity, commands) =>
            // We need also to check if Start is supported because if not we show play-pause
            supportsFeature(entity, VACUUM_SUPPORT_START) &&
            supportsFeature(entity, VACUUM_SUPPORT_PAUSE) &&
            commands.includes("start_pause") &&
            isCleaning(entity),
        isDisabled: () => false,
    },
    {
        icon: "mdi:play-pause",
        serviceName: "start_pause",
        isVisible: (entity, commands) =>
            // If start is supported, we don't show this button
            !supportsFeature(entity, VACUUM_SUPPORT_START) &&
            supportsFeature(entity, VACUUM_SUPPORT_PAUSE) &&
            commands.includes("start_pause"),
        isDisabled: () => false,
    },
    {
        icon: "mdi:stop",
        serviceName: "stop",
        isVisible: (entity, commands) =>
            supportsFeature(entity, VACUUM_SUPPORT_STOP) && commands.includes("stop"),
        isDisabled: (entity) => isStopped(entity),
    },
    {
        icon: "mdi:target-variant",
        serviceName: "clean_spot",
        isVisible: (entity, commands) =>
            supportsFeature(entity, VACUUM_SUPPORT_CLEAN_SPOT) && commands.includes("clean_spot"),
        isDisabled: () => false,
    },
    {
        icon: "mdi:map-marker",
        serviceName: "locate",
        isVisible: (entity, commands) =>
            supportsFeature(entity, VACUUM_SUPPORT_LOCATE) && commands.includes("locate"),
        isDisabled: (entity) => isReturningHome(entity),
    },
    {
        icon: "mdi:home-map-marker",
        serviceName: "return_to_base",
        isVisible: (entity, commands) =>
            supportsFeature(entity, VACUUM_SUPPORT_RETURN_HOME) && commands.includes("return_home"),
        isDisabled: () => false,
    },
];

@customElement("mushroom-vacuum-commands-control")
export class CoverButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: VacuumEntity;

    @property({ attribute: false }) public commands!: VacuumCommand[];

    @property({ type: Boolean }) public fill: boolean = false;

    private callService(e: CustomEvent) {
        e.stopPropagation();
        const entry = (e.target! as any).entry as VacuumButton;
        this.hass.callService("vacuum", entry.serviceName, {
            entity_id: this.entity!.entity_id,
        });
    }

    protected render(): TemplateResult {
        const rtl = computeRTL(this.hass);

        return html`
            <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
                ${VACUUM_BUTTONS.filter((item) => item.isVisible(this.entity, this.commands)).map(
                    (item) => html`
                        <mushroom-button
                            .entry=${item}
                            .disabled=${!isAvailable(this.entity) || item.isDisabled(this.entity)}
                            @click=${this.callService}
                        >
                            <ha-icon .icon=${item.icon}></ha-icon>
                        </mushroom-button>
                    `
                )}
            </mushroom-button-group>
        `;
    }
}
