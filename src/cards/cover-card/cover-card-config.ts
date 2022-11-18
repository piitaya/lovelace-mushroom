import { assign, boolean, object, optional } from "superstruct";
import { actionsSharedConfigStruct, ActionsSharedConfig } from "../../shared/config/actions-config";
import {
    appearanceSharedConfigStruct,
    AppearanceSharedConfig,
} from "../../shared/config/appearance-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { LovelaceCardConfig } from "../../ha";

export type CoverCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        display_battery?: boolean;
        show_buttons_control?: false;
        show_position_control?: false;
        show_tilt_position_control?: false;
    };

export const coverCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        display_battery: optional(boolean()),
        show_buttons_control: optional(boolean()),
        show_position_control: optional(boolean()),
        show_tilt_position_control: optional(boolean()),
    })
);
