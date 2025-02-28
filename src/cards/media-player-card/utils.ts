import { HassEntity } from "home-assistant-js-websocket";
import {
  HomeAssistant,
  MEDIA_PLAYER_SUPPORT_NEXT_TRACK,
  MEDIA_PLAYER_SUPPORT_PAUSE,
  MEDIA_PLAYER_SUPPORT_PLAY,
  MEDIA_PLAYER_SUPPORT_PREVIOUS_TRACK,
  MEDIA_PLAYER_SUPPORT_REPEAT_SET,
  MEDIA_PLAYER_SUPPORT_SHUFFLE_SET,
  MEDIA_PLAYER_SUPPORT_STOP,
  MEDIA_PLAYER_SUPPORT_TURN_OFF,
  MEDIA_PLAYER_SUPPORT_TURN_ON,
  MediaPlayerEntity,
  OFF,
  UNAVAILABLE,
  UNKNOWN,
  computeMediaDescription,
  supportsFeature,
} from "../../ha";
import {
  MediaPlayerCardConfig,
  MediaPlayerMediaControl,
} from "./media-player-card-config";

export function callService(
  e: MouseEvent,
  hass: HomeAssistant,
  stateObj: HassEntity,
  serviceName: string
): void {
  e.stopPropagation();
  hass.callService("media_player", serviceName, {
    entity_id: stateObj.entity_id,
  });
}

export function computeMediaNameDisplay(
  config: MediaPlayerCardConfig,
  entity: MediaPlayerEntity
): string {
  let name = config.name || entity.attributes.friendly_name || "";
  if (
    ![UNAVAILABLE, UNKNOWN, OFF].includes(entity.state) &&
    config.use_media_info
  ) {
    if (entity.attributes.media_title) {
      name = entity.attributes.media_title;
    }
  }
  return name;
}

export function computeMediaStateDisplay(
  config: MediaPlayerCardConfig,
  entity: MediaPlayerEntity,
  hass: HomeAssistant
): string {
  let state = hass.formatEntityState(entity);
  if (
    ![UNAVAILABLE, UNKNOWN, OFF].includes(entity.state) &&
    config.use_media_info
  ) {
    return computeMediaDescription(entity) || state;
  }
  return state;
}

export function getVolumeLevel(entity: MediaPlayerEntity) {
  return entity.attributes.volume_level != null
    ? entity.attributes.volume_level * 100
    : undefined;
}

export function computeMediaIcon(
  config: MediaPlayerCardConfig,
  entity: MediaPlayerEntity
): string | undefined {
  var icon = config.icon;

  if (
    ![UNAVAILABLE, UNKNOWN, OFF].includes(entity.state) &&
    config.use_media_info
  ) {
    var app = entity.attributes.app_name?.toLowerCase();
    switch (app) {
      case "spotify":
        return "mdi:spotify";
      case "google podcasts":
        return "mdi:google-podcast";
      case "plex":
        return "mdi:plex";
      case "soundcloud":
        return "mdi:soundcloud";
      case "youtube":
        return "mdi:youtube";
      case "oto music":
        return "mdi:music-circle";
      case "netflix":
        return "mdi:netflix";
      default:
        return undefined;
    }
  }
  return icon;
}

export interface ControlButton {
  icon: string;
  action: string;
}

export const computeMediaControls = (
  stateObj: MediaPlayerEntity,
  controls: MediaPlayerMediaControl[]
): ControlButton[] => {
  if (!stateObj) {
    return [];
  }

  const state = stateObj.state;

  if (state === "off") {
    return supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_TURN_ON) &&
      controls.includes("on_off")
      ? [
          {
            icon: "mdi:power",
            action: "turn_on",
          },
        ]
      : [];
  }

  const buttons: ControlButton[] = [];

  if (
    supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_TURN_OFF) &&
    controls.includes("on_off")
  ) {
    buttons.push({
      icon: "mdi:power",
      action: "turn_off",
    });
  }

  const assumedState = stateObj.attributes.assumed_state === true;
  const stateAttr = stateObj.attributes;

  if (
    (state === "playing" || state === "paused" || assumedState) &&
    supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_SHUFFLE_SET) &&
    controls.includes("shuffle")
  ) {
    buttons.push({
      icon: stateAttr.shuffle === true ? "mdi:shuffle" : "mdi:shuffle-disabled",
      action: "shuffle_set",
    });
  }

  if (
    (state === "playing" || state === "paused" || assumedState) &&
    supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_PREVIOUS_TRACK) &&
    controls.includes("previous")
  ) {
    buttons.push({
      icon: "mdi:skip-previous",
      action: "media_previous_track",
    });
  }

  if (
    !assumedState &&
    ((state === "playing" &&
      (supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_PAUSE) ||
        supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_STOP))) ||
      ((state === "paused" || state === "idle") &&
        supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_PLAY)) ||
      (state === "on" &&
        (supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_PLAY) ||
          supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_PAUSE)))) &&
    controls.includes("play_pause_stop")
  ) {
    buttons.push({
      icon:
        state === "on"
          ? "mdi:play-pause"
          : state !== "playing"
            ? "mdi:play"
            : supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_PAUSE)
              ? "mdi:pause"
              : "mdi:stop",
      action:
        state !== "playing"
          ? "media_play"
          : supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_PAUSE)
            ? "media_pause"
            : "media_stop",
    });
  }

  if (
    assumedState &&
    supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_PLAY) &&
    controls.includes("play_pause_stop")
  ) {
    buttons.push({
      icon: "mdi:play",
      action: "media_play",
    });
  }

  if (
    assumedState &&
    supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_PAUSE) &&
    controls.includes("play_pause_stop")
  ) {
    buttons.push({
      icon: "mdi:pause",
      action: "media_pause",
    });
  }

  if (
    assumedState &&
    supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_STOP) &&
    controls.includes("play_pause_stop")
  ) {
    buttons.push({
      icon: "mdi:stop",
      action: "media_stop",
    });
  }

  if (
    (state === "playing" || state === "paused" || assumedState) &&
    supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_NEXT_TRACK) &&
    controls.includes("next")
  ) {
    buttons.push({
      icon: "mdi:skip-next",
      action: "media_next_track",
    });
  }

  if (
    (state === "playing" || state === "paused" || assumedState) &&
    supportsFeature(stateObj, MEDIA_PLAYER_SUPPORT_REPEAT_SET) &&
    controls.includes("repeat")
  ) {
    buttons.push({
      icon:
        stateAttr.repeat === "all"
          ? "mdi:repeat"
          : stateAttr.repeat === "one"
            ? "mdi:repeat-once"
            : "mdi:repeat-off",
      action: "repeat_set",
    });
  }

  return buttons.length > 0 ? buttons : [];
};

export const formatMediaTime = (seconds: number | undefined): string => {
  if (seconds === undefined || seconds === Infinity) {
    return "";
  }

  let secondsString = new Date(seconds * 1000).toISOString();
  secondsString =
    seconds > 3600
      ? secondsString.substring(11, 16)
      : secondsString.substring(14, 19);
  return secondsString.replace(/^0+/, "").padStart(4, "0");
};

export const cleanupMediaTitle = (title?: string): string | undefined => {
  if (!title) {
    return undefined;
  }

  const index = title.indexOf("?authSig=");
  return index > 0 ? title.slice(0, index) : title;
};

/**
 * Set volume of a media player entity.
 * @param hass Home Assistant object
 * @param entity_id entity ID of media player
 * @param volume_level number between 0..1
 * @returns
 */
export const setMediaPlayerVolume = (
  hass: HomeAssistant,
  entity_id: string,
  volume_level: number
) =>
  hass.callService("media_player", "volume_set", { entity_id, volume_level });

export const handleMediaControlClick = (
  hass: HomeAssistant,
  stateObj: MediaPlayerEntity,
  action: string
) => {
  let parameters = {};

  if (action === "shuffle_set") {
    parameters = {
      shuffle: !stateObj!.attributes.shuffle,
    };
  } else if (action === "repeat_set") {
    parameters = {
      repeat:
        stateObj!.attributes.repeat === "all"
          ? "one"
          : stateObj!.attributes.repeat === "off"
            ? "all"
            : "off",
    };
  } else if (action === "volume_mute") {
    parameters = {
      is_volume_muted: !stateObj!.attributes.is_volume_muted,
    };
  }

  hass.callService("media_player", action, {
    entity_id: stateObj!.entity_id,
    ...parameters,
  });
};
