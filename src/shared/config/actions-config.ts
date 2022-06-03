import { object, optional } from "superstruct";
import { ActionConfig } from "../../ha/data/lovelace";
import { actionConfigStruct } from "../../ha/panels/lovelace/editor/structs/action-struct";

export const actionsSharedConfigStruct = object({
    tap_action: optional(actionConfigStruct),
    hold_action: optional(actionConfigStruct),
    double_tap_action: optional(actionConfigStruct),
});

export type ActionsSharedConfig = {
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
};
