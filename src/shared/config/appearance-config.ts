import { boolean, enums, Infer, object, optional } from "superstruct";
import setupCustomlocalize from "../../localize";
import { HaFormSchema } from "../../utils/form/ha-form";
import { IconType, ICON_TYPES, Info, INFOS } from "../../utils/info";
import { Layout, LAYOUTS, layoutStruct } from "../../utils/layout";

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

type CustomLocalize = ReturnType<typeof setupCustomlocalize>;

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function computeInfoOptions(customLocalize: CustomLocalize) {
  return INFOS.map((info) => ({
    value: info,
    label:
      customLocalize(`editor.form.info_picker.values.${info}`) ||
      capitalizeFirstLetter(info),
  }));
}

export function computeIconTypeOptions(customLocalize: CustomLocalize) {
  return ICON_TYPES.map((iconType) => ({
    value: iconType,
    label:
      customLocalize(`editor.form.icon_type_picker.values.${iconType}`) ||
      capitalizeFirstLetter(iconType),
  }));
}

export function computeAlignmentOptions(customLocalize: CustomLocalize) {
  const ALIGNMENT = ["start", "center", "end", "justify"] as const;
  return ALIGNMENT.map((alignment) => ({
    value: alignment,
    label: customLocalize(`editor.form.alignment_picker.values.${alignment}`),
  }));
}

export function computeLayoutOptions(customLocalize: CustomLocalize) {
  return LAYOUTS.map((layout) => ({
    value: layout,
    label: customLocalize(`editor.form.layout_picker.values.${layout}`),
  }));
}

export function computeAppearanceFormSchema(
  customLocalize: CustomLocalize
): HaFormSchema[] {
  return [
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "layout",
          selector: {
            select: {
              options: computeLayoutOptions(customLocalize),
              mode: "dropdown",
            },
          },
        },
        { name: "fill_container", selector: { boolean: {} } },
      ],
    },
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "primary_info",
          selector: {
            select: {
              options: computeInfoOptions(customLocalize),
              mode: "dropdown",
            },
          },
        },
        {
          name: "secondary_info",
          selector: {
            select: {
              options: computeInfoOptions(customLocalize),
              mode: "dropdown",
            },
          },
        },
        {
          name: "icon_type",
          selector: {
            select: {
              options: computeIconTypeOptions(customLocalize),
              mode: "dropdown",
            },
          },
        },
      ],
    },
  ];
}
