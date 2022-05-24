import { LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional } from "superstruct";
import { actionsSharedConfigStruct, ActionsSharedConfig } from "../../shared/config/actions-config";
import { layoutSharedConfigStruct, LayoutSharedConfig } from "../../shared/config/layout-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type CoverCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    LayoutSharedConfig &
    ActionsSharedConfig & {
        hide_state?: boolean;
        show_buttons_control?: false;
        show_position_control?: false;
    };

export const coverCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, layoutSharedConfigStruct, actionsSharedConfigStruct),
    object({
        hide_state: optional(boolean()),
        show_buttons_control: optional(boolean()),
        show_position_control: optional(boolean()),
    })
);
