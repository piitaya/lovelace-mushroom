import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, enums, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Info, INFOS } from "../../utils/info";
import { Attributes, ATTRIBUTES } from "../../utils/attributes";
import { Layout, layoutStruct } from "../../utils/layout";

export interface AttributeCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    icon_color?: string;
    hide_icon?: boolean;
    layout?: Layout;
    primary_info?: Info;
    primary_attribute?: Info;
    secondary_attribute?: Attributes;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const entityCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        icon_color: optional(string()),
        hide_icon: optional(boolean()),
        layout: optional(layoutStruct),
        primary_info: optional(enums(INFOS)),
        primary_attribute: optional(enums(INFOS)),
        secondary_attribute: optional(enums(ATTRIBUTES)),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
