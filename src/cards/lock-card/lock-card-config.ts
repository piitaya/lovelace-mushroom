import { assign, boolean, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { LayoutSharedConfig, layoutSharedConfigStruct } from "../../shared/config/layout-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type LockCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    LayoutSharedConfig &
    ActionsSharedConfig & {
        hide_state?: boolean;
    };

export const lockCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, layoutSharedConfigStruct, actionsSharedConfigStruct),
    object({
        hide_state: optional(boolean()),
    })
);
