# Light card

![Light light](../images/light-light.png)
![Light dark](../images/light-dark.png)

## Description

A light card allow you to control a light entity.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                      | Type                                                | Default     | Description                                                                         |
| :------------------------ | :-------------------------------------------------- | :---------- | :---------------------------------------------------------------------------------- |
| `entity`                  | string                                              | Required    | Light entity                                                                        |
| `icon`                    | string                                              | Optional    | Custom icon                                                                         |
| `name`                    | string                                              | Optional    | Custom name                                                                         |
| `layout`                  | string                                              | Optional    | Layout of the card. Vertical, horizontal and default layout are supported           |
| `fill_container`          | boolean                                             | `false`     | Fill container or not. Useful when card is in a grid, vertical or horizontal layout |
| `primary_info`            | `name` `state` `last-changed` `last-updated` `none` | `name`      | Info to show as primary info                                                        |
| `secondary_info`          | `name` `state` `last-changed` `last-updated` `none` | `state`     | Info to show as secondary info                                                      |
| `icon_type`               | `icon` `entity-picture` `none`                      | `icon`      | Type of icon to display                                                             |
| `show_brightness_control` | boolean                                             | `false`     | Show a slider to control brightness                                                 |
| `show_color_temp_control` | boolean                                             | `false`     | Show a slider to control temperature color                                          |
| `show_color_control`      | boolean                                             | `false`     | Show a slider to control RGB color                                                  |
| `show_white_control`      | boolean                                             | `false`     | Show a slider to control the white channel for RGBW color                                                |
| `show_cold_white_control` | boolean                                             | `false`     | Show a slider to control the cold white channel for RGBWW color                                                |
| `show_warm_white_control` | boolean                                             | `false`     | Show a slider to control the warm white channel for RGBWW color                                                |
| `collapsible_controls`    | boolean                                             | `false`     | Collapse controls when off                                                          |
| `use_light_color`         | boolean                                             | `false`     | Colorize the icon and slider according light temperature or color                   |
| `tap_action`              | action                                              | `toggle`    | Home assistant action to perform on tap                                             |
| `hold_action`             | action                                              | `more-info` | Home assistant action to perform on hold                                            |
| `double_tap_action`       | action                                              | `more-info` | Home assistant action to perform on double_tap                                      |
