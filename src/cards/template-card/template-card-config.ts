import { array, assign, boolean, object, optional, string, union } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import { LayoutSharedConfig, layoutSharedConfigStruct } from "../../shared/config/layout-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type TemplateCardConfig = LovelaceCardConfig &
    LayoutSharedConfig &
    ActionsSharedConfig & {
        entity?: string;
        icon?: string;
        icon_color?: string;
        badge_icon?: string;
        badge_color?: string;
        primary?: string;
        secondary?: string;
        multiline_secondary?: boolean;
        entity_id?: string | string[];
    };

export const templateCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(layoutSharedConfigStruct, actionsSharedConfigStruct),
    object({
        entity: optional(string()),
        icon: optional(string()),
        icon_color: optional(string()),
        badge_icon: optional(string()),
        badge_color: optional(string()),
        primary: optional(string()),
        secondary: optional(string()),
        multiline_secondary: optional(boolean()),
        entity_id: optional(union([string(), array(string())])),
    })
);