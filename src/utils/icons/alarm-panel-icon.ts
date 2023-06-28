export const alarmPanelIconAction = (state?: string) => {
    switch (state) {
        case "armed_away":
            return "mdi:shield-lock-outline";
        case "armed_vacation":
            return "mdi:shield-airplane-outline";
        case "armed_home":
            return "mdi:shield-home-outline";
        case "armed_night":
            return "mdi:shield-moon-outline";
        case "armed_custom_bypass":
            return "mdi:shield-half-full";
        case "disarmed":
            return "mdi:shield-off-outline";
        default:
            return "mdi:shield-outline";
    }
};
