# Template card

![Template light](../images/template-light.png)
![Template dark](../images/template-dark.png)

## Description

A template card allow you to build custom card.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                  | Type            | Default     | Description                                                                                                                         |
| :-------------------- | :-------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `icon`                | string          | Optional    | Icon to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                              |
| `icon_color`          | string          | Optional    | Icon color to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                        |
| `hide_icon`           | boolean         | `false`     | Hide the icon                                                                                                                       |
| `primary`             | string          | Optional    | Primary info to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                      |
| `secondary`           | string          | Optional    | Secondary info to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                    |
| `multiline_secondary` | boolean         | `false`     | Enables support for multiline text for the secondary info.                                                                          |
| `layout`              | string          | Optional    | Layout of the card. Vertical, horizontal and default layout are supported                                                           |
| `fill_container`      | boolean         | `false`     | Fill container or not. Useful when card is in a grid, vertical or horizontal layout                                                 |
| `hide_state`          | boolean         | `false`     | Hide the entity state                                                                                                               |
| `tap_action`          | action          | `none`      | Home assistant action to perform on tap                                                                                             |
| `hold_action`         | action          | `none`      | Home assistant action to perform on hold                                                                                            |
| `entity_id`           | `string` `list` | Optional    | Only reacts to the state changes of these entities. This can be used if the automatic analysis fails to find all relevant entities. |
| `double_tap_action`   | action          | `more-info` | Home assistant action to perform on double_tap                                                                                      |
