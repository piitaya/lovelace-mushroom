import { boolean, enums, Infer, object, optional } from "superstruct";
import { HaFormSchema } from "../../utils/form/ha-form";
import { IconType, ICON_TYPES, Info, INFOS } from "../../utils/info";
import { Layout, layoutStruct } from "../../utils/layout";

export const appearanceSharedConfigStruct = object({
  layout: optional(layoutStruct),
  fill_container: optional(boolean()),
  primary_info: optional(enums(INFOS)),
  secondary_info: optional(enums(INFOS)),
  icon_type: optional(enums(ICON_TYPES)),
});

export type AppearanceSharedConfig = Infer<typeof appearanceSharedConfigStruct>;

export type Appearance = {
  layout: Layout;
  fill_container: boolean;
  primary_info: Info;
  secondary_info: Info;
  icon_type: IconType;
};

export const APPEARANCE_FORM_SCHEMA: HaFormSchema[] = [
  {
    type: "grid",
    name: "",
    schema: [
      { name: "layout", selector: { mush_layout: {} } },
      { name: "fill_container", selector: { boolean: {} } },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "primary_info", selector: { mush_info: {} } },
      { name: "secondary_info", selector: { mush_info: {} } },
      { name: "icon_type", selector: { mush_icon_type: {} } },
    ],
  },
];
