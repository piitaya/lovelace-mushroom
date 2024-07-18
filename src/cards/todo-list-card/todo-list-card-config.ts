import { assign, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import {
    AppearanceSharedConfig,
    appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { actionsSharedConfigStruct } from "../../shared/config/actions-config";

export type TodoListCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig & {
        checked_icon?: string;
        unchecked_icon?: string;
    };

export const todoListCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        checked_icon: optional(string()),
        unchecked_icon: optional(string()),
    })
);
