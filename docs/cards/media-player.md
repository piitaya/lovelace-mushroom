# Media Player card

![Media Player light](../images/media-player-light.png)
![Media Player dark](../images/media-player-dark.png)

## Description

A media player card allow you to control a media player entity.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                    | Type    | Default     | Description                                                               |
| :---------------------- | :------ | :---------- | :------------------------------------------------------------------------ |
| `entity`                | string  | Required    | Media Player entity                                                       |
| `icon`                  | string  | Optional    | Custom icon                                                               |
| `name`                  | string  | Optional    | Custom name                                                               |
| `layout`                | string  | Optional    | Layout of the card. Vertical, horizontal and default layout are supported |
| `show_buttons_control`  | boolean | `false`     | Show buttons control                                                      |
| `show_volume_control`   | boolean | `false`     | Show volume control                                                       |
| `tap_action`            | action  | `toggle`    | Home assistant action to perform on tap                                   |
| `hold_action`           | action  | `more-info` | Home assistant action to perform on hold                                  |
| `double_tap_action`     | action  | `more-info` | Home assistant action to perform on double_tap                            |
