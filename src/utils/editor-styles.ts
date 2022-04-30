import { any, object, string } from "superstruct";

export const baseLovelaceCardConfig = object({
    type: string(),
    view_layout: any(),
});
