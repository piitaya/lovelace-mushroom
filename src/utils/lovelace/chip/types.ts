import { ActionConfig } from "custom-card-helpers";

export type ActionChipConfig = {
    type: "action";
    icon?: string;
    icon_color?: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
};

export type BackChipConfig = {
    type: "back";
    icon?: string;
};

export type EntityChipConfig = {
    type: "entity";
    entity: string;
    icon?: string;
    icon_color?: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
};

export type MenuChipConfig = {
    type: "menu";
    icon?: string;
};

export type WeatherChipConfig = {
    type: "weather";
    entity: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
    show_temperature?: boolean;
    show_conditions?: boolean;
};

export type TemplateChipConfig = {
    type: "template";
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
    content?: string;
    icon?: string;
    icon_color?: string;
    entity_id?: string | string[];
};

export type LovelaceChipConfig =
    | ActionChipConfig
    | BackChipConfig
    | EntityChipConfig
    | MenuChipConfig
    | WeatherChipConfig
    | TemplateChipConfig;
