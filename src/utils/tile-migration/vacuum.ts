import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig } from "./common";

const TILE_VACUUM_COMMANDS = [
  "start_pause",
  "stop",
  "clean_spot",
  "locate",
  "return_home",
];

/**
 * Vacuum Card → Tile Card Migration
 *
 * Mapped:
 *   commands → feature: vacuum-commands (with commands list)
 *
 * Not mapped (no tile equivalent):
 *   commands: "on_off" - the vacuum-commands feature has no on/off command
 *   icon_animation     - not supported by tile card
 */
export function migrateVacuumCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  const commands = config.commands?.filter((command: string) =>
    TILE_VACUUM_COMMANDS.includes(command)
  );
  if (commands?.length) {
    features.push({
      type: "vacuum-commands",
      commands,
    });
  }

  if (features.length > 0) result.features = features;
  return result;
}
