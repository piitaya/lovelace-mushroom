import { ActionConfig } from "custom-card-helpers";
import { object, optional } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";

export const actionsSharedConfigStruct = object({
    tap_action: optional(actionConfigStruct),
    hold_action: optional(actionConfigStruct),
    double_tap_action: optional(actionConfigStruct),
});

// TODO : fix action config type and struct
export type ActionsSharedConfig = {
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
};
