# Vacuum card

![Vacuum light](../images/vacuum-light.png)
![Vacuum dark](../images/vacuum-dark.png)

## Description

A vacuum card allows you to control a vacuum entity.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                     | Type                                                | Default     | Description                                                                         |
| :----------------------- | :-------------------------------------------------- | :---------- | :---------------------------------------------------------------------------------- |
| `entity`                 | string                                              | Required    | Vacuum entity                                                                       |
| `icon`                   | string                                              | Optional    | Custom icon                                                                         |
| `name`                   | string                                              | Optional    | Custom name                                                                         |
| `layout`                 | string                                              | Optional    | Layout of the card. Vertical, horizontal and default layout are supported           |
| `fill_container`         | boolean                                             | `false`     | Fill container or not. Useful when card is in a grid, vertical or horizontal layout |
| `primary_info`           | `name` `state` `last-changed` `last-updated` `none` | `name`      | Info to show as primary info                                                        |
| `secondary_info`         | `name` `state` `last-changed` `last-updated` `none` | `state`     | Info to show as secondary info                                                      |
| `icon_type`              | `icon` `entity-picture` `none`                      | `icon`      | Type of icon to display                                                             |
| `icon_animation`         | boolean                                             | `false`     | Animate the icon when vacuum is `cleaning`                                          |
| `commands`               | list                                                | `[]`        | List of commands to display (start_pause, stop, locate, clean_spot, return_home)    |
| `show_fan_speed_control` | boolean                                             | `false`     | Show a dropdown to change the vacuum fan speed                                      |
| `show_fan_speed_state`   | boolean                                             | `false`     | Show the current fan speed next to the state                                        |
| `mode_entity`            | string                                              | Optional    | `select`/`input_select` entity for the cleaning mode (vacuum, mop, vacuum & mop...) |
| `show_mode_control`      | boolean                                             | `false`     | Show a dropdown to change the cleaning mode                                         |
| `show_mode_state`        | boolean                                             | `false`     | Show the current cleaning mode next to the state                                    |
| `tap_action`             | action                                              | `more-info` | Home assistant action to perform on tap                                             |
| `hold_action`            | action                                              | `more-info` | Home assistant action to perform on hold                                            |
| `double_tap_action`      | action                                              | `more-info` | Home assistant action to perform on double_tap                                      |

### Fan speed and cleaning mode

Most integrations (Roborock, Dreame, Ecovacs...) expose the cleaning mode (vacuum, mop, vacuum & mop...) as a separate `select` entity. Set it as `mode_entity` and enable `show_mode_control` to get a dropdown in the card.

When `mode_entity` is set, the cleaning mode dropdown is also added to the vacuum dialog that opens when you tap the card (next to the fan speed).

```yaml
type: custom:mushroom-vacuum-card
entity: vacuum.robot
commands:
  - start_pause
  - return_home
show_fan_speed_control: true
show_fan_speed_state: true
mode_entity: select.robot_cleaning_mode
show_mode_control: true
show_mode_state: true
```
