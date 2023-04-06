# Countdown card

![Countdown light](../images/countdown-light.png)
![Countdown dark](../images/countdown-dark.png)

## Description

A countdown card allows you to display a countdown updated every second until a timestamp from any entity that's state is a timestamp. Otherwise acts as Entity card.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                | Type                                                | Default     | Description                                                                          |
| :------------------ | :-------------------------------------------------- | :---------- | :----------------------------------------------------------------------------------- |
| `entity`            | string                                              | Required    | Entity that provides a timestamp as a state                                          |
| `timeup_message`    | string                                              | optional    | String to be displayed when timer is elapsed until no longer a timestamp (cleared)   |
| `unknown_message`   | string                                              | optional    | String to be displayed when timer in unknown state (ex: when no timer set for alexa) |
| `icon`              | string                                              | Optional    | Custom icon                                                                          |
| `icon_color`        | string                                              | `blue`      | Custom color for icon when entity is state is active                                 |
| `name`              | string                                              | Optional    | Custom name                                                                          |
| `layout`            | string                                              | Optional    | Layout of the card. Vertical, horizontal and default layout are supported            |
| `fill_container`    | boolean                                             | `false`     | Fill container or not. Useful when card is in a grid, vertical or horizontal layout  |
| `primary_info`      | `name` `state` `last-changed` `last-updated` `none` | `name`      | Info to show as primary info                                                         |
| `secondary_info`    | `name` `state` `last-changed` `last-updated` `none` | `state`     | Info to show as secondary info                                                       |
| `icon_type`         | `icon` `entity-picture` `none`                      | `icon`      | Type of icon to display                                                              |
| `tap_action`        | action                                              | `more-info` | Home assistant action to perform on tap                                              |
| `hold_action`       | action                                              | `more-info` | Home assistant action to perform on hold                                             |
| `double_tap_action` | action                                              | `more-info` | Home assistant action to perform on double_tap                                       |
