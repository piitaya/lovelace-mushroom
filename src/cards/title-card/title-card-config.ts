import { LovelaceCardConfig } from "custom-card-helpers";
import { assign, object, optional, string } from "superstruct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";

export interface TitleCardConfig extends LovelaceCardConfig {
    title?: string;
    subtitle?: string;
    alignment?: string;
}

export const titleCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        title: optional(string()),
        subtitle: optional(string()),
        alignment: optional(string()),
    })
);
