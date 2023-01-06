import { Infer, object, optional, string } from "superstruct";
import { HaFormSchema } from "../../utils/form/ha-form";

export const entitySharedConfigStruct = object({
    entity: optional(string()),
    name: optional(string()),
    icon: optional(string()),
    icon_color: optional(string()),
});

export type EntitySharedConfig = Infer<typeof entitySharedConfigStruct>;

export const computeEntityFormSchema = (
    icon?: string,
    domain?: string | string[],
    optionalFields?: "icon_animation"[]
): HaFormSchema[] => [
    {
        type: "grid",
        name: "",
        schema: [
            { name: "entity", selector: { entity: { domain } } },
            { name: "name", selector: { text: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "icon", selector: { icon: { placeholder: icon } } },
            { name: "icon_color", selector: { "mush-color": {} } },
            ...(optionalFields?.includes("icon_animation")
                ? [{ name: "icon_animation", selector: { boolean: {} } }]
                : []),
        ],
    },
];
