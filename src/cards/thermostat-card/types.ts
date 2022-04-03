import { StyleInfo } from "lit/directives/style-map.js";

export type HvacAction = "off" | "heating" | "cooling" | "drying" | "idle";

export type HvacMode = "off" | "heat" | "cool" | "heat_cool" | "auto" | "dry" | "fan_only";

export type Indicator = { style: StyleInfo; value?: string; visible: boolean };
