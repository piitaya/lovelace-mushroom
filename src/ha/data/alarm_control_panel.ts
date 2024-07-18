import {
  HassEntityAttributeBase,
  HassEntityBase,
} from "home-assistant-js-websocket";
import { HomeAssistant } from "../types";
import { getExtendedEntityRegistryEntry } from "./entity_registry";

export const enum AlarmControlPanelEntityFeature {
  ARM_HOME = 1,
  ARM_AWAY = 2,
  ARM_NIGHT = 4,
  TRIGGER = 8,
  ARM_CUSTOM_BYPASS = 16,
  ARM_VACATION = 32,
}

export type AlarmMode =
  | "armed_home"
  | "armed_away"
  | "armed_night"
  | "armed_vacation"
  | "armed_custom_bypass"
  | "disarmed";

interface AlarmControlPanelEntityAttributes extends HassEntityAttributeBase {
  code_format?: "text" | "number";
  changed_by?: string | null;
  code_arm_required?: boolean;
}

export interface AlarmControlPanelEntity extends HassEntityBase {
  attributes: AlarmControlPanelEntityAttributes;
}

type AlarmConfig = {
  service: string;
  feature?: AlarmControlPanelEntityFeature;
  icon: string;
};

export const ALARM_MODES: Record<AlarmMode, AlarmConfig> = {
  armed_home: {
    feature: AlarmControlPanelEntityFeature.ARM_HOME,
    service: "alarm_arm_home",
    icon: "mdi:home",
  },
  armed_away: {
    feature: AlarmControlPanelEntityFeature.ARM_AWAY,
    service: "alarm_arm_away",
    icon: "mdi:lock",
  },
  armed_night: {
    feature: AlarmControlPanelEntityFeature.ARM_NIGHT,
    service: "alarm_arm_night",
    icon: "mdi:moon-waning-crescent",
  },
  armed_vacation: {
    feature: AlarmControlPanelEntityFeature.ARM_VACATION,
    service: "alarm_arm_vacation",
    icon: "mdi:airplane",
  },
  armed_custom_bypass: {
    feature: AlarmControlPanelEntityFeature.ARM_CUSTOM_BYPASS,
    service: "alarm_arm_custom_bypass",
    icon: "mdi:shield",
  },
  disarmed: {
    service: "alarm_disarm",
    icon: "mdi:shield-off",
  },
};

export const setProtectedAlarmControlPanelMode = async (
  element: HTMLElement,
  hass: HomeAssistant,
  stateObj: AlarmControlPanelEntity,
  mode: AlarmMode
) => {
  const { service } = ALARM_MODES[mode];

  let code: string | undefined;

  if (
    (mode !== "disarmed" && stateObj.attributes.code_arm_required) ||
    (mode === "disarmed" && stateObj.attributes.code_format)
  ) {
    const entry = await getExtendedEntityRegistryEntry(
      hass,
      stateObj.entity_id
    ).catch(() => undefined);
    const defaultCode = entry?.options?.alarm_control_panel?.default_code;

    if (!defaultCode) {
      const disarm = mode === "disarmed";

      const helpers = await (window as any).loadCardHelpers();

      const response = await helpers.showEnterCodeDialog(element, {
        codeFormat: stateObj.attributes.code_format,
        title: hass.localize(
          `ui.card.alarm_control_panel.${disarm ? "disarm" : "arm"}`
        ),
        submitText: hass.localize(
          `ui.card.alarm_control_panel.${disarm ? "disarm" : "arm"}`
        ),
      });
      if (response == null) {
        throw new Error("Code dialog closed");
      }
      code = response;
    }
  }

  await hass.callService("alarm_control_panel", service, {
    entity_id: stateObj.entity_id,
    code,
  });
};
