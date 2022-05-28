import { assign, boolean, object, optional, string } from "superstruct";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import {
    appearanceSharedConfigStruct,
    AppearanceSharedConfig,
} from "../../shared/config/appearance-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { LovelaceCardConfig } from "../../ha";

export type EntityCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        icon_color?: string;
        hide_icon?: boolean;
        use_entity_picture?: boolean;
    };

export const entityCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        icon_color: optional(string()),
        use_entity_picture: optional(boolean()),
        hide_icon: optional(boolean()),
    })
);
