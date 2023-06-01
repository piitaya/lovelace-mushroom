import { assign, boolean, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import {
    AppearanceSharedConfig,
    appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type LightCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        icon_color?: string;
        show_brightness_control?: boolean;
        show_color_temp_control?: boolean;
        show_color_control?: boolean;
        collapsible_controls?: boolean;
        use_light_color?: boolean;
        use_entity_two?: boolean;
        use_icon_two?: boolean;
        use_attribute_two?: boolean;
        entity_two?: any;
        icon_two?: string;
        attribute_two?: string;
    };

export const lightCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        icon_color: optional(string()),
        show_brightness_control: optional(boolean()),
        show_color_temp_control: optional(boolean()),
        show_color_control: optional(boolean()),
        collapsible_controls: optional(boolean()),
        use_light_color: optional(boolean()),
        use_entity_two: optional(boolean()),
        use_icon_two: optional(boolean()),
        use_attribute_two: optional(boolean()),
        entity_two: optional(string()),
        icon_two: optional(string()),
        attribute_two: optional(string()),
    })
);
