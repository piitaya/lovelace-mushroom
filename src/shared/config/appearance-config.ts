import { boolean, enums, Infer, object, optional } from "superstruct";
import { IconInfo, ICON_INFOS, Info, INFOS } from "../../utils/info";
import { Layout, layoutStruct } from "../../utils/layout";

export const appearanceSharedConfigStruct = object({
    layout: optional(layoutStruct),
    fill_container: optional(boolean()),
    primary_info: optional(enums(INFOS)),
    secondary_info: optional(enums(INFOS)),
    icon_info: optional(enums(ICON_INFOS)),
});

export type AppearanceSharedConfig = Infer<typeof appearanceSharedConfigStruct>;

export type Appearance = {
    layout: Layout;
    fill_container: boolean;
    primary_info: Info;
    secondary_info: Info;
    icon_info: IconInfo;
};

export function computeAppearance(
    config: AppearanceSharedConfig & { [key: string]: any }
): Appearance {
    let defaultIconInfo: IconInfo = "icon";
    if (config.hide_icon) {
        defaultIconInfo = "entity-picture";
    } else if (config.use_entity_picture || config.use_media_artwork) {
        defaultIconInfo = "none";
    }

    return {
        layout: config.layout ?? (Boolean(config.vertical) ? "vertical" : "default"),
        fill_container: config.fill_container ?? false,
        icon_info: config.icon_info ?? defaultIconInfo,
        primary_info: config.primary_info ?? (Boolean(config.primary_info) ? "none" : "name"),
        secondary_info:
            config.secondary_info ?? (Boolean(config.secondary_info) ? "none" : "state"),
    };
}
