import { HassEntity } from "home-assistant-js-websocket";
import { UNIT_C, UNIT_F } from "../../ha";

const FIXED_DEVICE_CLASS_ICONS = {
    apparent_power: "mdi:flash",
    aqi: "mdi:air-filter",
    atmospheric_pressure: "mdi:thermometer-lines",
    // battery: "mdi:battery", => not included by design since `sensorIcon()` will dynamically determine the icon
    carbon_dioxide: "mdi:molecule-co2",
    carbon_monoxide: "mdi:molecule-co",
    current: "mdi:current-ac",
    data_rate: "mdi:transmission-tower",
    data_size: "mdi:database",
    date: "mdi:calendar",
    distance: "mdi:arrow-left-right",
    duration: "mdi:progress-clock",
    energy: "mdi:lightning-bolt",
    frequency: "mdi:sine-wave",
    gas: "mdi:meter-gas",
    humidity: "mdi:water-percent",
    illuminance: "mdi:brightness-5",
    irradiance: "mdi:sun-wireless",
    moisture: "mdi:water-percent",
    monetary: "mdi:cash",
    nitrogen_dioxide: "mdi:molecule",
    nitrogen_monoxide: "mdi:molecule",
    nitrous_oxide: "mdi:molecule",
    ozone: "mdi:molecule",
    pm1: "mdi:molecule",
    pm10: "mdi:molecule",
    pm25: "mdi:molecule",
    power: "mdi:flash",
    power_factor: "mdi:angle-acute",
    precipitation: "mdi:weather-rainy",
    precipitation_intensity: "mdi:weather-pouring",
    pressure: "mdi:gauge",
    reactive_power: "mdi:flash",
    signal_strength: "mdi:wifi",
    sound_pressure: "mdi:ear-hearing",
    speed: "mdi:speedometer",
    sulphur_dioxide: "mdi:molecule",
    temperature: "mdi:thermometer",
    timestamp: "mdi:clock",
    volatile_organic_compounds: "mdi:molecule",
    voltage: "mdi:sine-wave",
    volume: "mdi:car-coolant-level",
    water: "mdi:water",
    weight: "mdi:weight",
    wind_speed: "mdi:weather-windy",
};

const SENSOR_DEVICE_CLASS_BATTERY = "battery";

const BATTERY_ICONS = {
    10: "mdi:battery-10",
    20: "mdi:battery-20",
    30: "mdi:battery-30",
    40: "mdi:battery-40",
    50: "mdi:battery-50",
    60: "mdi:battery-60",
    70: "mdi:battery-70",
    80: "mdi:battery-80",
    90: "mdi:battery-90",
    100: "mdi:battery",
};
const BATTERY_CHARGING_ICONS = {
    10: "mdi:battery-charging-10",
    20: "mdi:battery-charging-20",
    30: "mdi:battery-charging-30",
    40: "mdi:battery-charging-40",
    50: "mdi:battery-charging-50",
    60: "mdi:battery-charging-60",
    70: "mdi:battery-charging-70",
    80: "mdi:battery-charging-80",
    90: "mdi:battery-charging-90",
    100: "mdi:battery-charging",
};

const batteryStateIcon = (batteryEntity: HassEntity, batteryChargingEntity?: HassEntity) => {
    const battery = batteryEntity.state;
    const batteryCharging = batteryChargingEntity?.state === "on";

    return batteryIcon(battery, batteryCharging);
};

export const batteryIcon = (batteryState: number | string, batteryCharging?: boolean) => {
    const batteryValue = Number(batteryState);
    if (isNaN(batteryValue)) {
        if (batteryState === "off") {
            return "mdi:battery";
        }
        if (batteryState === "on") {
            return "mdi:battery-alert";
        }
        return "mdi:battery-unknown";
    }

    const batteryRound = Math.round(batteryValue / 10) * 10;
    if (batteryCharging && batteryValue >= 10) {
        return BATTERY_CHARGING_ICONS[batteryRound];
    }
    if (batteryCharging) {
        return "mdi:battery-charging-outline";
    }
    if (batteryValue <= 5) {
        return "mdi:battery-alert-variant-outline";
    }
    return BATTERY_ICONS[batteryRound];
};

export const sensorIcon = (entity?: HassEntity): string | undefined => {
    const dclass = entity?.attributes.device_class;

    if (dclass && dclass in FIXED_DEVICE_CLASS_ICONS) {
        return FIXED_DEVICE_CLASS_ICONS[dclass];
    }

    if (dclass === SENSOR_DEVICE_CLASS_BATTERY) {
        return entity ? batteryStateIcon(entity) : "mdi:battery";
    }

    const unit = entity?.attributes.unit_of_measurement;
    if (unit === UNIT_C || unit === UNIT_F) {
        return "mdi:thermometer";
    }

    return undefined;
};
