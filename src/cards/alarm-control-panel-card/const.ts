import { PREFIX_NAME } from "../../const";

export const ALARM_CONTROl_PANEL_CARD_NAME = `${PREFIX_NAME}-alarm-control-panel-card`;
export const ALARM_CONTROl_PANEL_CARD_EDITOR_NAME = `${ALARM_CONTROl_PANEL_CARD_NAME}-editor`;
export const ALARM_CONTROl_PANEL_ENTITY_DOMAINS = ["alarm_control_panel"];

export const ALARM_CONTROL_PANEL_CARD_STATE_ICON = {
    disarmed: "mdi:shield-off-outline",
    arming: "mdi:shield-sync-outline",
    armed_away: "mdi:shield-lock-outline",
    armed_home: "mdi:shield-home-outline",
    armed_night: "mdi:shield-moon-outline",
    armed_vacation: "mdi:shield-airplane-outline",
    armed_custom_bypass: "mdi:shield-half-full",
    pending: "mdi:shield-sync",
    triggered: "mdi:bell-ring-outline",
    unavailable: "mdi:bell-remove-outline",
};
export const ALARM_CONTROL_PANEL_CARD_DEFAULT_STATE_ICON = "mdi:shield-lock-outline";

export const ALARM_CONTROL_PANEL_CARD_STATE_COLOR = {
    disarmed: "var(--rgb-state-alarm-disarmed)",
    armed: "var(--rgb-state-alarm-armed)",
    triggered: "var(--rgb-state-alarm-triggered)",
    unavailable: "var(--rgb-warning)",
};

export const ALARM_CONTROL_PANEL_CARD_DEFAULT_STATE_COLOR = "var(--rgb-grey)";

export const ALARM_CONTROL_PANEL_CARD_STATE_SERVICE = {
    disarmed: "alarm_disarm",
    armed_away: "alarm_arm_away",
    armed_home: "alarm_arm_home",
    armed_night: "alarm_arm_night",
    armed_vacation: "alarm_arm_vacation",
    armed_custom_bypass: "alarm_arm_custom_bypass",
};

/*
armed_away, armed_home, armed_night, arming, disarmed, pending, triggered and unavailable
*/
