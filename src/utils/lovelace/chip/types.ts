import { ActionConfig, HomeAssistant } from "../../../ha";
import { Info } from "../../info";

export interface LovelaceChip extends HTMLElement {
  hass?: HomeAssistant;
  editMode?: boolean;
  preview?: boolean;
  setConfig(config: LovelaceChipConfig);
}

export type ActionChipConfig = {
  type: "action";
  icon?: string;
  icon_color?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
};

export type AlarmControlPanelChipConfig = {
  type: "alarm-control-panel";
  entity?: string;
  name?: string;
  content_info?: Info;
  icon?: string;
  icon_color?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
};

export type BackChipConfig = {
  type: "back";
  icon?: string;
};

export type EntityChipConfig = {
  type: "entity";
  entity?: string;
  name?: string;
  content_info?: Info;
  icon?: string;
  icon_color?: string;
  use_entity_picture?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
};

export type MenuChipConfig = {
  type: "menu";
  icon?: string;
};

export type WeatherChipConfig = {
  type: "weather";
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  show_temperature?: boolean;
  show_conditions?: boolean;
};

export type TemplateChipConfig = {
  type: "template";
  entity?: string;
  hold_action?: ActionConfig;
  tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  content?: string;
  icon?: string;
  icon_color?: string;
  picture?: string;
  entity_id?: string | string[];
};

export interface ConditionalChipConfig {
  type: "conditional";
  chip?: LovelaceChipConfig;
  conditions: any[];
}

export type LightChipConfig = {
  type: "light";
  entity?: string;
  name?: string;
  content_info?: Info;
  icon?: string;
  use_light_color?: boolean;
  hold_action?: ActionConfig;
  tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
};

export type SpacerChipConfig = {
  type: "spacer";
};

export type LovelaceChipConfig =
  | ActionChipConfig
  | AlarmControlPanelChipConfig
  | BackChipConfig
  | EntityChipConfig
  | MenuChipConfig
  | WeatherChipConfig
  | TemplateChipConfig
  | ConditionalChipConfig
  | LightChipConfig
  | SpacerChipConfig;

export const CHIP_LIST: LovelaceChipConfig["type"][] = [
  "action",
  "alarm-control-panel",
  "back",
  "conditional",
  "entity",
  "light",
  "menu",
  "spacer",
  "template",
  "weather",
];
