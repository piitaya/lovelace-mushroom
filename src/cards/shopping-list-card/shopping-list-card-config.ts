import { assign, string, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import {
    AppearanceSharedConfig,
    appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type ShoppingListCardConfig = LovelaceCardConfig &
    AppearanceSharedConfig & {
        name?: string;
        icon?: string;
        checked_icon?: string;
        unchecked_icon?: string;
    };

export const shoppingListCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    appearanceSharedConfigStruct,
    object({
        name: optional(string()),
        icon: optional(string()),
        checked_icon: optional(string()),
        unchecked_icon: optional(string()),
    })
);
