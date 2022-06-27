import { object, optional } from "superstruct";
import { ActionConfig, actionConfigStruct } from "../../ha";
import { Action } from "../../utils/form/custom/ha-selector-mushroom-action";
import { HaFormSchema } from "../../utils/form/ha-form";

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

export const computeActionsFormSchema = (actions?: Action[]): HaFormSchema[] => [
    { name: "tap_action", selector: { "mush-action": { actions } } },
    { name: "hold_action", selector: { "mush-action": { actions } } },
    { name: "double_tap_action", selector: { "mush-action": { actions } } },
];
