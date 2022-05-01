import { literal, union } from "superstruct";

export type Layout = "vertical" | "horizontal" | "default";

export const layoutStruct = union([literal("horizontal"), literal("vertical"), literal("default")]);

type ConfigWithLayout = {
    layout?: Layout;
    fill_container?: boolean;
    [key: string]: any;
};
export function getLayoutFromConfig(config: ConfigWithLayout): Layout {
    // Backward compatibility for vertical option
    return config.layout ?? (Boolean(config.vertical) ? "vertical" : "default");
}
