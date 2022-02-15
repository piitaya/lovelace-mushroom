# Alarm control panel card

![Alarm light](../images/alarm-light.png)
![Alarm dark](../images/alarm-dark.png)

## Description

A alarm control panel card allow you to control a alarm panel entity.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                | Type    | Default                        | Description                                    |
| :------------------ | :------ | :----------------------------- | :--------------------------------------------- |
| `entity`            | string  | Required                       | Alarm control panel entity                     |
| `icon`              | string  | Optional                       | Custom icon                                    |
| `name`              | string  | Optional                       | Custom name                                    |
| `vertical`          | boolean | `false`                        | Vertical layout                                |
| `hide_state`        | boolean | `false`                        | Hide the entity state                          |
| `states`            | list    | `["armed_home", "armed_away"]` | List of arm states to display                  |
| `tap_action`        | action  | `more-info`                    | Home assistant action to perform on tap        |
| `hold_action`       | action  | `more-info`                    | Home assistant action to perform on hold       |
| `double_tap_action` | action  | `more-info`                    | Home assistant action to perform on double_tap |
