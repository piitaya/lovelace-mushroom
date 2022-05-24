import { LovelaceCardConfig } from "custom-card-helpers";
import { assign, object, optional, string } from "superstruct";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export interface TitleCardConfig extends LovelaceCardConfig {
    title?: string;
    subtitle?: string;
    alignment?: string;
}

export const titleCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    object({
        title: optional(string()),
        subtitle: optional(string()),
        alignment: optional(string()),
    })
);
