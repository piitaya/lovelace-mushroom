import { boolean, Infer, object, optional } from "superstruct";
import { layoutStruct } from "../../utils/layout";

export const layoutSharedConfigStruct = object({
    layout: optional(layoutStruct),
    fill_container: optional(boolean()),
});

export type LayoutSharedConfig = Infer<typeof layoutSharedConfigStruct>;
