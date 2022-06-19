import { any, number, object, optional, string } from "superstruct";

export const lovelaceCardConfigStruct = object({
    index: optional(number()),
    view_index: optional(number()),
    view_layout: any(),
    type: string(),
});
