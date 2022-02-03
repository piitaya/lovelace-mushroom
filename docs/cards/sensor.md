# Sensor card

![Sensor light](../images/sensor-light.png)
![Sensor dark](../images/sensor-dark.png)

## Description

A sensor card allow you to control a sensor entity.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name             | Type    | Default                                             | Description                              |
| :--------------- | :------ | :-------------------------------------------------- | :--------------------------------------- |
| `entity`         | string  | Required                                            | Sensor entity                            |
| `icon`           | string  | Optional                                            | Custom icon                              |
| `icon_color`     | string  | `blue`                                              | Custom color for icon                    |
| `name`           | string  | Optional                                            | Custom name                              |
| `vertical`       | boolean | `false`                                             | Vertical layout                          |
| `primary_info`   | boolean | `name` `state`                                      | Info to show as primary info             |
| `secondary_info` | boolean | `name` `state` `last-changed` `last-updated` `none` | Info to show as secondary info           |
| `tap_action`     | action  | `more-info`                                         | Home assistant action to perform on tap  |
| `hold_action`    | action  | `more-info`                                         | Home assistant action to perform on hold |
