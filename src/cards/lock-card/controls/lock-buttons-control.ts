import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  computeRTL,
  HomeAssistant,
  isAvailable,
  LockEntity,
  LOCK_SUPPORT_OPEN,
  supportsFeature,
} from "../../../ha";
import setupCustomlocalize from "../../../localize";
import { isActionPending, isLocked, isUnlocked } from "../utils";

interface LockButton {
  icon: string;
  title?: string;
  serviceName?: string;
  isVisible: (entity: LockEntity) => boolean;
  isDisabled: (entity: LockEntity) => boolean;
}

export const LOCK_BUTTONS: LockButton[] = [
  {
    icon: "mdi:lock",
    title: "lock",
    serviceName: "lock",
    isVisible: (entity) => isUnlocked(entity),
    isDisabled: () => false,
  },
  {
    icon: "mdi:lock-open",
    title: "unlock",
    serviceName: "unlock",
    isVisible: (entity) => isLocked(entity),
    isDisabled: () => false,
  },
  {
    icon: "mdi:lock-clock",
    isVisible: (entity) => isActionPending(entity),
    isDisabled: () => true,
  },
  {
    icon: "mdi:door-open",
    title: "open",
    serviceName: "open",
    isVisible: (entity) =>
      supportsFeature(entity, LOCK_SUPPORT_OPEN) && isUnlocked(entity),
    isDisabled: (entity) => isActionPending(entity),
  },
];

@customElement("mushroom-lock-buttons-control")
export class LockButtonsControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: LockEntity;

  @property({ type: Boolean }) public fill: boolean = false;

  private callService(e: CustomEvent) {
    e.stopPropagation();
    const entry = (e.target! as any).entry as LockButton;
    this.hass.callService("lock", entry.serviceName!, {
      entity_id: this.entity!.entity_id,
    });
  }

  protected render(): TemplateResult {
    const rtl = computeRTL(this.hass);
    const customLocalize = setupCustomlocalize(this.hass!);

    return html`
      <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}
        >${LOCK_BUTTONS.filter((item) => item.isVisible(this.entity)).map(
          (item) => html`
            <mushroom-button
              .entry=${item}
              .title=${item.title
                ? customLocalize(`editor.card.lock.${item.title}`)
                : ""}
              .disabled=${!isAvailable(this.entity) ||
              item.isDisabled(this.entity)}
              @click=${this.callService}
            >
              <ha-icon .icon=${item.icon}></ha-icon>
            </mushroom-button>
          `
        )}</mushroom-button-group
      >
    `;
  }
}
