import { assign, boolean, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import {
    AppearanceSharedConfig,
    appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type PersonCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        hide_state?: boolean;
        hide_name?: boolean;
        use_entity_picture?: boolean;
    };

export const personCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        use_entity_picture: optional(boolean()),
        hide_state: optional(boolean()),
        hide_name: optional(boolean()),
    })
);
