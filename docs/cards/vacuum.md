# Vacuum card

![Vacuum light](../images/vacuum-light.png)
![Vacuum dark](../images/vacuum-dark.png)

## Description

A vacuum card allow you to control a vacuum entity.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                       | Type    | Default     | Description                                                               |
| :------------------------- | :------ | :---------- | :------------------------------------------------------------------------ |
| `entity`                   | string  | Required    | Vacuum entity                                                             |
| `icon`                     | string  | Optional    | Custom icon                                                               |
| `name`                     | string  | Optional    | Custom name                                                               |
| `layout`                   | string  | Optional    | Layout of the card. Vertical, horizontal and default layout are supported |
| `hide_state`               | boolean | `false`     | Hide the entity state                                                     |
| `show_start_pause_control` | boolean | `false`     | Show buttons start / pause the vacuum                                     |
| `show_stop_control`        | boolean | `false`     | Show button to stop the vacuum                                            |
| `show_locate_control`      | boolean | `false`     | Show button to locate the vacuum                                          |
| `show_clean_spot_control`  | boolean | `false`     | Show button to clean a spot with the vacuum                               |
| `show_return_home_control` | boolean | `false`     | Show button to return home the vacuum                                     |
| `tap_action`               | action  | `toggle`    | Home assistant action to perform on tap                                   |
| `hold_action`              | action  | `more-info` | Home assistant action to perform on hold                                  |
| `double_tap_action`        | action  | `more-info` | Home assistant action to perform on double_tap                            |
