import { LovelaceCardConfig } from "../ha";
import { TemplateCardConfig } from "../cards/template-card/template-card-config";

type Info = "name" | "state" | "last-changed" | "last-updated" | "none";

function infoToTemplate(
  info: Info | string | undefined,
  defaultInfo: Info,
  customName?: string
): string | undefined {
  const effective = (info || defaultInfo) as Info;
  switch (effective) {
    case "name":
      return customName || "{{ state_attr(entity, 'friendly_name') }}";
    case "state":
      return "{{ states(entity) }}";
    case "last-changed":
      return "{{ relative_time(states[entity].last_changed) }}";
    case "last-updated":
      return "{{ relative_time(states[entity].last_updated) }}";
    case "none":
      return undefined;
    default:
      return undefined;
  }
}

function mapCardFeatures(config: LovelaceCardConfig): any[] {
  const type = config.type as string;
  const features: any[] = [];

  if (type?.includes("light-card")) {
    if (config.show_brightness_control) {
      features.push({ type: "light-brightness" });
    }
    if (config.show_color_temp_control) {
      features.push({ type: "light-color-temp" });
    }
  } else if (type?.includes("cover-card")) {
    if (config.show_buttons_control) {
      features.push({ type: "cover-open-close" });
    }
    if (config.show_position_control) {
      features.push({ type: "cover-position" });
    }
    if (config.show_tilt_position_control) {
      features.push({ type: "cover-tilt-position" });
    }
  } else if (type?.includes("climate-card")) {
    if (config.hvac_modes?.length) {
      features.push({
        type: "climate-hvac-modes",
        hvac_modes: config.hvac_modes,
      });
    }
    if (config.show_temperature_control) {
      features.push({ type: "target-temperature" });
    }
  } else if (type?.includes("fan-card")) {
    if (config.show_percentage_control) {
      features.push({ type: "fan-speed" });
    }
  } else if (type?.includes("humidifier-card")) {
    if (config.show_target_humidity_control) {
      features.push({ type: "target-humidity" });
    }
  } else if (type?.includes("lock-card")) {
    features.push({ type: "lock-commands" });
  } else if (type?.includes("vacuum-card")) {
    if (config.commands?.length) {
      features.push({
        type: "vacuum-commands",
        commands: config.commands,
      });
    }
  } else if (type?.includes("alarm-control-panel-card")) {
    if (config.states?.length) {
      features.push({
        type: "alarm-modes",
        modes: config.states,
      });
    }
  } else if (type?.includes("update-card")) {
    if (config.show_buttons_control) {
      features.push({ type: "update-actions" });
    }
  } else if (type?.includes("number-card")) {
    features.push({ type: "numeric-input" });
  } else if (type?.includes("select-card")) {
    features.push({ type: "select-options" });
  } else if (type?.includes("media-player-card")) {
    if (config.volume_controls?.includes("volume_set")) {
      features.push({ type: "media-player-volume-slider" });
    }
  }

  return features;
}

export function migrateCardToTile(
  config: LovelaceCardConfig
): TemplateCardConfig {
  const result: TemplateCardConfig = {
    type: "custom:mushroom-template-card",
  };

  // Entity context
  if (config.entity) {
    result.entity = config.entity;
  }

  // Map primary info (default: name)
  const primary = infoToTemplate(
    config.primary_info,
    "name",
    config.name
  );
  if (primary) {
    result.primary = primary;
  }

  // Map secondary info (default: state)
  const secondary = infoToTemplate(config.secondary_info, "state");
  if (secondary) {
    result.secondary = secondary;
  }

  // Map icon / picture
  if (config.icon_type === "entity-picture") {
    result.picture = "{{ state_attr(entity, 'entity_picture') }}";
  } else if (config.icon_type !== "none") {
    if (config.icon) {
      result.icon = config.icon;
    }
  }

  // Map color
  if (config.icon_color) {
    result.color = config.icon_color;
  }

  // Map layout
  if (config.layout === "vertical") {
    result.vertical = true;
  }

  // Map actions
  if (config.tap_action) {
    result.tap_action = config.tap_action;
  }
  if (config.hold_action) {
    result.hold_action = config.hold_action;
  }
  if (config.double_tap_action) {
    result.double_tap_action = config.double_tap_action;
  }

  // Map card-specific controls to tile features
  const features = mapCardFeatures(config);
  if (features.length > 0) {
    result.features = features;
  }

  return result;
}
