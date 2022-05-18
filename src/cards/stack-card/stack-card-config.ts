import { LovelaceCardConfig } from "custom-card-helpers";
import { array, assign, object, optional, string } from "superstruct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface StackCardConfig extends LovelaceCardConfig {
    title?: string;
    layout?: Layout;
    cards: LovelaceCardConfig[];
    styles?: object;
}

export const stackCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        title: optional(string()),
        layout: optional(layoutStruct),
        cards: optional(array()),
        styles: optional(object()),
    })
);
