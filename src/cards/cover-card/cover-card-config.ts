import { assign, boolean, object, optional } from "superstruct";
import { actionsSharedConfigStruct, ActionsSharedConfig } from "../../shared/config/actions-config";
import {
    appearanceSharedConfigStruct,
    AppearanceSharedConfig,
} from "../../shared/config/appearance-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { LovelaceCardConfig, actionConfigStruct, CallServiceActionConfig} from "../../ha";

export type CoverCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        show_buttons_control?: false;
        show_position_control?: false;
        show_tilt_position_control?: false;
        close_cover_action?: CallServiceActionConfig;
        stop_cover_action?: CallServiceActionConfig;
        open_cover_action?: CallServiceActionConfig;
};

export const coverCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        show_buttons_control: optional(boolean()),
        show_position_control: optional(boolean()),
        show_tilt_position_control: optional(boolean()),
        close_cover_action: optional(actionConfigStruct),
        stop_cover_action: optional(actionConfigStruct),
        open_cover_action: optional(actionConfigStruct)
    })
);

