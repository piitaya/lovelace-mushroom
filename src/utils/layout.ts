import { literal, union } from "superstruct";

export type Layout = "vertical" | "horizontal";

export const layoutStruct = union([literal("horizontal"), literal("vertical")]);

type ConfigWithLayout = {
    layout?: Layout;
    [key: string]: any;
};
export function getLayoutFromConfig(config: ConfigWithLayout): Layout | undefined {
    // Backward compatibility for vertical option
    return config.layout ?? (Boolean(config.vertical) ? "vertical" : undefined);
}
