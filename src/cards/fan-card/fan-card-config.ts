import { assign, boolean, object, optional, array, string, integer  } from "superstruct";
import { actionsSharedConfigStruct, ActionsSharedConfig } from "../../shared/config/actions-config";
import {
    appearanceSharedConfigStruct,
    AppearanceSharedConfig,
} from "../../shared/config/appearance-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { LovelaceCardConfig } from "../../ha";

export interface FanPresetConfig {
    value: number;
    icon?: string;
}

export type FanCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        icon_animation?: boolean;
        show_percentage_control?: boolean;
        show_oscillate_control?: boolean;
        collapsible_controls?: boolean;
        presets? : FanPresetConfig[];
    };

export const fanCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        icon_animation: optional(boolean()),
        show_percentage_control: optional(boolean()),
        show_oscillate_control: optional(boolean()),
        collapsible_controls: optional(boolean()),
        presets: optional(array(object({
            value: integer(),
            icon: optional(string())
        })))
    })
);
