const DOMAIN_TO_ROW_TYPE = {
    alert: "toggle",
    automation: "toggle",
    climate: "climate",
    cover: "cover",
    fan: "toggle",
    group: "group",
    input_boolean: "toggle",
    input_number: "input-number",
    input_select: "input-select",
    input_text: "input-text",
    light: "toggle",
    lock: "lock",
    media_player: "media-player",
    remote: "toggle",
    scene: "scene",
    script: "script",
    sensor: "sensor",
    timer: "timer",
    switch: "toggle",
    vacuum: "toggle",
    water_heater: "climate",
    input_datetime: "input-datetime",
};

export const computeRowType = (entityId: string): string => {
    const domain = entityId.split(".", 1)[0];
    const rowType = DOMAIN_TO_ROW_TYPE[domain];
    return `hui-${rowType || "text"}-entity-row`;
};
