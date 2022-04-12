# Vacuum card

![Vacuum light](../images/vacuum-light.png)
![Vacuum dark](../images/vacuum-dark.png)

## Description

A vacuum card allow you to control a vacuum entity.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                | Type    | Default     | Description                                                                      |
| :------------------ | :------ | :---------- | :------------------------------------------------------------------------------- |
| `entity`            | string  | Required    | Vacuum entity                                                                    |
| `icon`              | string  | Optional    | Custom icon                                                                      |
| `name`              | string  | Optional    | Custom name                                                                      |
| `layout`            | string  | Optional    | Layout of the card. Vertical, horizontal and default layout are supported        |
| `hide_state`        | boolean | `false`     | Hide the entity state                                                            |
| `commands`          | list    | `[]`        | List of commands to display (start_pause, stop, locate, clean_spot, return_home) |
| `tap_action`        | action  | `more-info` | Home assistant action to perform on tap                                          |
| `hold_action`       | action  | `more-info` | Home assistant action to perform on hold                                         |
| `double_tap_action` | action  | `more-info` | Home assistant action to perform on double_tap                                   |
