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
  command: VacuumCommand;
  isSupported: (entity: VacuumEntity) => boolean;
  isVisible?: (entity: VacuumEntity) => boolean;
  isDisabled: (entity: VacuumEntity) => boolean;
}

export const isButtonVisible = (
  entity: VacuumEntity,
  button: VacuumButton,
  commands: VacuumCommand[]
) =>
  isButtonSupported(entity, button, commands) &&
  (!button.isVisible || button.isVisible(entity));

export const isButtonSupported = (
  entity: VacuumEntity,
  button: VacuumButton,
  commands: VacuumCommand[]
) => button.isSupported(entity) && commands.includes(button.command);

export const isCommandsControlVisible = (
  entity: VacuumEntity,
  commands: VacuumCommand[]
) => VACUUM_BUTTONS.some((button) => isButtonVisible(entity, button, commands));

export const isCommandsControlSupported = (
  entity: VacuumEntity,
  commands: VacuumCommand[]
) =>
  VACUUM_BUTTONS.some((button) => isButtonSupported(entity, button, commands));

export const VACUUM_BUTTONS: VacuumButton[] = [
  {
    icon: "mdi:power",
    serviceName: "turn_on",
    command: "on_off",
    isSupported: (entity) => supportsFeature(entity, VACUUM_SUPPORT_TURN_ON),
    isVisible: (entity) => !isActive(entity),
    isDisabled: () => false,
  },
  {
    icon: "mdi:power",
    serviceName: "turn_off",
    command: "on_off",
    isSupported: (entity) => supportsFeature(entity, VACUUM_SUPPORT_TURN_OFF),
    isVisible: (entity) => isActive(entity),
    isDisabled: () => false,
  },
  {
    icon: "mdi:play",
    serviceName: "start",
    command: "start_pause",
    isSupported: (entity) => supportsFeature(entity, VACUUM_SUPPORT_START),
    isVisible: (entity) => !isCleaning(entity),
    isDisabled: () => false,
  },
  {
    icon: "mdi:pause",
    serviceName: "pause",
    command: "start_pause",
    isSupported: (entity) =>
      // We need also to check if Start is supported because if not we show play-pause
      supportsFeature(entity, VACUUM_SUPPORT_START) &&
      supportsFeature(entity, VACUUM_SUPPORT_PAUSE),
    isVisible: (entity) => isCleaning(entity),
    isDisabled: () => false,
  },
  {
    icon: "mdi:play-pause",
    serviceName: "start_pause",
    command: "start_pause",
    isSupported: (entity) =>
      // If start is supported, we don't show this button
      !supportsFeature(entity, VACUUM_SUPPORT_START) &&
      supportsFeature(entity, VACUUM_SUPPORT_PAUSE),
    isDisabled: () => false,
  },
  {
    icon: "mdi:stop",
    serviceName: "stop",
    command: "stop",
    isSupported: (entity) => supportsFeature(entity, VACUUM_SUPPORT_STOP),
    isDisabled: (entity) => isStopped(entity),
  },
  {
    icon: "mdi:target-variant",
    serviceName: "clean_spot",
    command: "clean_spot",
    isSupported: (entity) => supportsFeature(entity, VACUUM_SUPPORT_CLEAN_SPOT),
    isDisabled: () => false,
  },
  {
    icon: "mdi:map-marker",
    serviceName: "locate",
    command: "locate",
    isSupported: (entity) => supportsFeature(entity, VACUUM_SUPPORT_LOCATE),
    isDisabled: (entity) => isReturningHome(entity),
  },
  {
    icon: "mdi:home-map-marker",
    serviceName: "return_to_base",
    command: "return_home",
    isSupported: (entity) =>
      supportsFeature(entity, VACUUM_SUPPORT_RETURN_HOME),
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
        ${VACUUM_BUTTONS.filter((item) =>
          isButtonVisible(this.entity, item, this.commands)
        ).map(
          (item) => html`
            <mushroom-button
              .entry=${item}
              .disabled=${!isAvailable(this.entity) ||
              item.isDisabled(this.entity)}
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
