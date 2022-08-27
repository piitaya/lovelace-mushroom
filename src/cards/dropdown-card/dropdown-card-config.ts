import { array, assign, boolean, object, optional, string } from "superstruct";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import {
    appearanceSharedConfigStruct,
    AppearanceSharedConfig,
} from "../../shared/config/appearance-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { LovelaceCardConfig } from "../../ha";

export type DropdownCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        icon_color?: string;
        default_open?: boolean;
        hide_arrow?: boolean;
    };

export const dropdownCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        entities: optional(array(string())),
        icon_color: optional(string()),
        default_open: optional(boolean()),
        hide_arrow: optional(boolean()),
    })
);
