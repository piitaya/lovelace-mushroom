import { HomeAssistant } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { supportsFeature } from "../../../ha/common/entity/supports-feature";
import { isAvailable } from "../../../ha/data/entity";
import {
    VacuumEntity,
    VACUUM_SUPPORT_CLEAN_SPOT,
    VACUUM_SUPPORT_LOCATE,
    VACUUM_SUPPORT_PAUSE,
    VACUUM_SUPPORT_RETURN_HOME,
    VACUUM_SUPPORT_START,
    VACUUM_SUPPORT_STOP,
} from "../../../ha/data/vacuum";
import { isCleaning, isReturningHome, isStopped } from "../utils";
import { VacuumCardConfig } from "../vacuum-card-config";

interface VacuumCommand {
    icon: string;
    serviceName: string;
    isVisible: (entity: VacuumEntity, config: VacuumCardConfig) => boolean;
    isDisabled: (entity: VacuumEntity) => boolean;
}

export const VACUUM_COMMANDS: VacuumCommand[] = [
    {
        icon: "mdi:play",
        serviceName: "start",
        isVisible: (entity, config) =>
            supportsFeature(entity, VACUUM_SUPPORT_START) &&
            Boolean(config.show_start_pause_control) &&
            !isCleaning(entity),
        isDisabled: () => false,
    },
    {
        icon: "mdi:pause",
        serviceName: "pause",
        isVisible: (entity, config) =>
            // We need also to check if Start is supported because if not we show play-pause
            supportsFeature(entity, VACUUM_SUPPORT_START) &&
            supportsFeature(entity, VACUUM_SUPPORT_PAUSE) &&
            Boolean(config.show_start_pause_control) &&
            isCleaning(entity),
        isDisabled: () => false,
    },
    {
        icon: "mdi:play-pause",
        serviceName: "start_pause",
        isVisible: (entity, config) =>
            // If start is supported, we don't show this button
            !supportsFeature(entity, VACUUM_SUPPORT_START) &&
            supportsFeature(entity, VACUUM_SUPPORT_PAUSE) &&
            Boolean(config.show_start_pause_control),
        isDisabled: () => false,
    },
    {
        icon: "mdi:stop",
        serviceName: "stop",
        isVisible: (entity, config) =>
            supportsFeature(entity, VACUUM_SUPPORT_STOP) && Boolean(config.show_stop_control),
        isDisabled: (entity) => isStopped(entity),
    },
    {
        icon: "mdi:target-variant",
        serviceName: "clean_spot",
        isVisible: (entity, config) =>
            supportsFeature(entity, VACUUM_SUPPORT_CLEAN_SPOT) &&
            Boolean(config.show_clean_spot_control),
        isDisabled: () => false,
    },
    {
        icon: "mdi:map-marker",
        serviceName: "locate",
        isVisible: (entity, config) =>
            supportsFeature(entity, VACUUM_SUPPORT_LOCATE) && Boolean(config.show_locate_control),
        isDisabled: (entity) => isReturningHome(entity),
    },
    {
        icon: "mdi:home-map-marker",
        serviceName: "return_to_base",
        isVisible: (entity, config) =>
            supportsFeature(entity, VACUUM_SUPPORT_RETURN_HOME) &&
            Boolean(config.show_return_home_control),
        isDisabled: () => false,
    },
];

@customElement("mushroom-vacuum-commands-control")
export class CoverButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: VacuumEntity;

    @property({ attribute: false }) public config!: VacuumCardConfig;

    @property() public fill: boolean = false;

    private callService(e: CustomEvent) {
        e.stopPropagation();
        const entry = (e.target! as any).entry as VacuumCommand;
        this.hass.callService("vacuum", entry.serviceName, {
            entity_id: this.entity!.entity_id,
        });
    }

    protected render(): TemplateResult {
        return html`
            <mushroom-button-group .fill=${this.fill}>
                ${VACUUM_COMMANDS.filter((item) => item.isVisible(this.entity, this.config)).map(
                    (item) => html`
                        <mushroom-button
                            .icon=${item.icon}
                            .entry=${item}
                            .disabled=${!isAvailable(this.entity) || item.isDisabled(this.entity)}
                            @click=${this.callService}
                        ></mushroom-button>
                    `
                )}
            </mushroom-button-group>
        `;
    }
}
