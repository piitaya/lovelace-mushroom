import { object, optional } from "superstruct";
import { ActionConfig, actionConfigStruct, atLeastHaVersion } from "../../ha";
import { HaFormSchema } from "../../utils/form/ha-form";
import { UiAction } from "../../utils/form/ha-selector";

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

export const computeActionsFormSchema = (version: string, actions?: UiAction[]): HaFormSchema[] => [
    {
        name: "tap_action",
        selector: atLeastHaVersion(version, 2022, 11)
            ? { "ui-action": { actions } }
            : { "mush-action": { actions } },
    },
    {
        name: "hold_action",
        selector: atLeastHaVersion(version, 2022, 11)
            ? { "ui-action": { actions } }
            : { "mush-action": { actions } },
    },
    {
        name: "double_tap_action",
        selector: atLeastHaVersion(version, 2022, 11)
            ? { "ui-action": { actions } }
            : { "mush-action": { actions } },
    },
];
