import {
  Appearance,
  AppearanceSharedConfig,
} from "../shared/config/appearance-config";
import { IconType, Info } from "./info";
import { Layout } from "./layout";

type AdditionalConfig = { [key: string]: any };

export function computeAppearance(
  config: AppearanceSharedConfig & AdditionalConfig
): Appearance {
  return {
    layout: config.layout ?? getDefaultLayout(config),
    fill_container: config.fill_container ?? false,
    primary_info: config.primary_info ?? getDefaultPrimaryInfo(config),
    secondary_info: config.secondary_info ?? getDefaultSecondaryInfo(config),
    icon_type: config.icon_type ?? getDefaultIconType(config),
  };
}

function getDefaultLayout(config: AdditionalConfig): Layout {
  if (config.vertical) {
    return "vertical";
  }
  return "default";
}

function getDefaultIconType(config: AdditionalConfig): IconType {
  if (config.hide_icon) {
    return "none";
  }
  if (config.use_entity_picture || config.use_media_artwork) {
    return "entity-picture";
  }
  return "icon";
}

function getDefaultPrimaryInfo(config: AdditionalConfig): Info {
  if (config.hide_name) {
    return "none";
  }
  return "name";
}

function getDefaultSecondaryInfo(config: AdditionalConfig): Info {
  if (config.hide_state) {
    return "none";
  }
  return "state";
}
