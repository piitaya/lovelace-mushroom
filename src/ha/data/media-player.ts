import { HassEntityAttributeBase, HassEntityBase } from "home-assistant-js-websocket";

/* STATES */
export const MEDIA_PLAYER_STATE_IDLE = "idle"
export const MEDIA_PLAYER_STATE_OFF = "off"
export const MEDIA_PLAYER_STATE_PLAYING = "playing"
export const MEDIA_PLAYER_STATE_PAUSED = "paused"

/* SUPPORTED FEATURES */
export const MEDIA_PLAYER_SUPPORT_PAUSE = 1
export const MEDIA_PLAYER_SUPPORT_SEEK = 2
export const MEDIA_PLAYER_SUPPORT_VOLUME_SET = 4
export const MEDIA_PLAYER_SUPPORT_VOLUME_MUTE = 8
export const MEDIA_PLAYER_SUPPORT_PREVIOUS_TRACK = 16
export const MEDIA_PLAYER_SUPPORT_NEXT_TRACK = 32
export const MEDIA_PLAYER_SUPPORT_TURN_ON = 128
export const MEDIA_PLAYER_SUPPORT_TURN_OFF = 256
export const MEDIA_PLAYER_SUPPORT_PLAY_MEDIA = 512
export const MEDIA_PLAYER_SUPPORT_VOLUME_STEP = 1024
export const MEDIA_PLAYER_SUPPORT_SELECT_SOURCE = 2048
export const MEDIA_PLAYER_SUPPORT_STOP = 4096
export const MEDIA_PLAYER_SUPPORT_CLEAR_PLAYLIST = 8192
export const MEDIA_PLAYER_SUPPORT_PLAY = 16384
export const MEDIA_PLAYER_SUPPORT_SHUFFLE_SET = 32768
export const MEDIA_PLAYER_SUPPORT_SELECT_SOUND_MODE = 65536
export const MEDIA_PLAYER_SUPPORT_BROWSE_MEDIA = 131072
export const MEDIA_PLAYER_SUPPORT_REPEAT_SET = 262144
export const MEDIA_PLAYER_SUPPORT_GROUPING = 524288

interface MediaPlayerEntityAttributes extends HassEntityAttributeBase {
    app_id: string;
    app_name: string;
    entity_picture_local: string;
    group_members: string[];
    source: string;
    source_list: string[];
    media_album_artist: string;
    media_album_name: string;
    media_artist: string;
    media_channel: string;
    media_content_id: string;
    media_content_type: string;
    media_duration: number;
    enqueue: string;
    extra: string;
    media_episode: number;
    media_playlist: string;
    media_position: string;
    media_position_updated_at: Date;
    repeat: string;
    media_season: number;
    seek_position: number;
    media_series_title: string;
    shuffle: string;
    media_title: string;
    media_track: number;
    volume_level: number;
    is_volume_muted: boolean;
    sound_mode: string;
    sound_mode_list: string[];
}

export interface MediaPlayerEntity extends HassEntityBase {
    attributes: MediaPlayerEntityAttributes;
}