import { LovelaceCardConfig } from "../../ha";
import { migrateAlarmControlPanelCard } from "./alarm-control-panel";
import { migrateClimateCard } from "./climate";
import { TileCardConfig, migrateCommonConfig } from "./common";
import { migrateCoverCard } from "./cover";
import { migrateEntityCard } from "./entity";
import { migrateFanCard } from "./fan";
import { migrateHumidifierCard } from "./humidifier";
import { migrateLightCard } from "./light";
import { migrateLockCard } from "./lock";
import { migrateMediaPlayerCard } from "./media-player";
import { migrateNumberCard } from "./number";
import { migratePersonCard } from "./person";
import { migrateSelectCard } from "./select";
import { migrateUpdateCard } from "./update";
import { migrateVacuumCard } from "./vacuum";

export type { TileCardConfig } from "./common";
export { migrateCommonConfig } from "./common";

const CARD_MIGRATIONS: Record<
  string,
  (config: LovelaceCardConfig) => TileCardConfig
> = {
  "custom:mushroom-alarm-control-panel-card": migrateAlarmControlPanelCard,
  "custom:mushroom-climate-card": migrateClimateCard,
  "custom:mushroom-cover-card": migrateCoverCard,
  "custom:mushroom-entity-card": migrateEntityCard,
  "custom:mushroom-fan-card": migrateFanCard,
  "custom:mushroom-humidifier-card": migrateHumidifierCard,
  "custom:mushroom-light-card": migrateLightCard,
  "custom:mushroom-lock-card": migrateLockCard,
  "custom:mushroom-media-player-card": migrateMediaPlayerCard,
  "custom:mushroom-number-card": migrateNumberCard,
  "custom:mushroom-person-card": migratePersonCard,
  "custom:mushroom-select-card": migrateSelectCard,
  "custom:mushroom-update-card": migrateUpdateCard,
  "custom:mushroom-vacuum-card": migrateVacuumCard,
};

export function migrateCardToTile(
  config: LovelaceCardConfig
): TileCardConfig {
  const migrateFn = CARD_MIGRATIONS[config.type];
  if (migrateFn) {
    return migrateFn(config);
  }
  // Fallback: common fields only
  return migrateCommonConfig(config);
}
