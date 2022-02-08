import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";

/*
 * TODO: make configurable icons, icons according to zone, show state indicator
 */
export interface PersonCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    use_entity_picture?: boolean;
    vertical?: boolean;
    hide_state?: boolean;
    hide_name?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
}

export const personCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        use_entity_picture: optional(boolean()),
        vertical: optional(boolean()),
        hide_state: optional(boolean()),
        hide_name: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
    })
);
