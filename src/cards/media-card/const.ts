import { PREFIX_NAME } from "../../const";

export const MEDIA_CARD_NAME = `${PREFIX_NAME}-media-card`;
export const MEDIA_CARD_EDITOR_NAME = `${MEDIA_CARD_NAME}-editor`;
export const MEDIA_ENTITY_DOMAINS = ["media_player"];

/* STATES */
export const STATE_IDLE = "idle"
export const STATE_OFF = "off"
export const STATE_PLAYING = "playing"
export const STATE_PAUSED = "paused"

/* SUPPORTED FEATURES */
export const SUPPORT_PAUSE = 1
export const SUPPORT_SEEK = 2
export const SUPPORT_VOLUME_SET = 4
export const SUPPORT_VOLUME_MUTE = 8
export const SUPPORT_PREVIOUS_TRACK = 16
export const SUPPORT_NEXT_TRACK = 32
export const SUPPORT_TURN_ON = 128
export const SUPPORT_TURN_OFF = 256
export const SUPPORT_PLAY_MEDIA = 512
export const SUPPORT_VOLUME_STEP = 1024
export const SUPPORT_SELECT_SOURCE = 2048
export const SUPPORT_STOP = 4096
export const SUPPORT_CLEAR_PLAYLIST = 8192
export const SUPPORT_PLAY = 16384
export const SUPPORT_SHUFFLE_SET = 32768
export const SUPPORT_SELECT_SOUND_MODE = 65536
export const SUPPORT_BROWSE_MEDIA = 131072
export const SUPPORT_REPEAT_SET = 262144
export const SUPPORT_GROUPING = 524288

/* AVAILABLE ATTRIBUTES */
export const ATTR_APP_ID = "app_id"
export const ATTR_APP_NAME = "app_name"
export const ATTR_ENTITY_PICTURE_LOCAL = "entity_picture_local"
export const ATTR_GROUP_MEMBERS = "group_members"
export const ATTR_INPUT_SOURCE = "source"
export const ATTR_INPUT_SOURCE_LIST = "source_list"
export const ATTR_MEDIA_ALBUM_ARTIST = "media_album_artist"
export const ATTR_MEDIA_ALBUM_NAME = "media_album_name"
export const ATTR_MEDIA_ARTIST = "media_artist"
export const ATTR_MEDIA_CHANNEL = "media_channel"
export const ATTR_MEDIA_CONTENT_ID = "media_content_id"
export const ATTR_MEDIA_CONTENT_TYPE = "media_content_type"
export const ATTR_MEDIA_DURATION = "media_duration"
export const ATTR_MEDIA_ENQUEUE = "enqueue"
export const ATTR_MEDIA_EXTRA = "extra"
export const ATTR_MEDIA_EPISODE = "media_episode"
export const ATTR_MEDIA_PLAYLIST = "media_playlist"
export const ATTR_MEDIA_POSITION = "media_position"
export const ATTR_MEDIA_POSITION_UPDATED_AT = "media_position_updated_at"
export const ATTR_MEDIA_REPEAT = "repeat"
export const ATTR_MEDIA_SEASON = "media_season"
export const ATTR_MEDIA_SEEK_POSITION = "seek_position"
export const ATTR_MEDIA_SERIES_TITLE = "media_series_title"
export const ATTR_MEDIA_SHUFFLE = "shuffle"
export const ATTR_MEDIA_TITLE = "media_title"
export const ATTR_MEDIA_TRACK = "media_track"
export const ATTR_MEDIA_VOLUME_LEVEL = "volume_level"
export const ATTR_MEDIA_VOLUME_MUTED = "is_volume_muted"
export const ATTR_SOUND_MODE = "sound_mode"
export const ATTR_SOUND_MODE_LIST = "sound_mode_list"

/* SERVICES */