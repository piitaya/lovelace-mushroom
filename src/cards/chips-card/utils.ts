import { PREFIX_NAME } from "../../const";

export function computeChipComponentName(type: string): string {
    return `${PREFIX_NAME}-${type}-chip`;
}
