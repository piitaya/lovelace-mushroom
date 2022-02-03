import { version } from "../package.json";

export { AlarmControlPanelCard } from "./cards/alarm-control-panel-card/alarm-control-panel-card";
export { ChipsCard } from "./cards/chips-card/chips-card";
export { CoverCard } from "./cards/cover-card/cover-card";
export { FanCard } from "./cards/fan-card/fan-card";
export { LightCard } from "./cards/light-card/light-card";
export { PersonCard } from "./cards/person-card/person-card";
export { SwitchCard } from "./cards/switch-card/switch-card";
export { TemplateCard } from "./cards/template-card/template-card";
export { EntityCard } from "./cards/entity-card/entity-card";

console.info(
    `%c🍄 Mushroom 🍄 - ${version}`,
    "color: #ef5350; font-weight: 700;"
);
