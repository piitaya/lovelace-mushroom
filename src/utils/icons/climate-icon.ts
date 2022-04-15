export const climateIcon = (state?: string) => {
    if (!state) state = "unknown";
    const icon = {
        auto: "mdi:calendar-sync",
        heat_cool: "mdi:autorenew",
        heat: "mdi:fire",
        cool: "mdi:snowflake",
        off: "mdi:power",
        fan_only: "mdi:fan",
        dry: "mdi:water-percent",
    }[state];
    return icon ? icon : "mdi:thermostat";
};

export const climateIconAction = (action?: string) => {
    if (!action) action = "unknown";
    const icon = {
        off: "mdi:power",
        heating: "mdi:fire",
        cooling: "mdi:snowflake",
        drying: "mdi:water-percent",
        idle: "mdi:thermostat",
        fan: "mdi:fan",
    }[action];
    return icon ? icon : "mdi:thermostat";
};
