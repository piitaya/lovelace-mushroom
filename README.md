# 🍄 Mushroom (--Better-Sliders)

<!-- [![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]
![downloads][downloads-badge]
![build][build-badge]
 -->
[original-repo]: https://github.com/piitaya/lovelace-mushroom

![Overview](https://raw.githubusercontent.com/phischdev/lovelace-mushroom-better-sliders/master/.github/images/readme_image.png)

## What is mushroom-better-sliders?
This is a fork of the fantastic [Mushrooms UI Cards][original-repo] by piitaya, a collection of cards for [Home Assistant][home-assistant] Dashboard UI.

> :warning: **This mod will not work, if you still have the original Mushroom installed**

It focuses on making the sliders more touch friendly.

1. Sliders move on reduced speed when dragged by a finger (easier to hit small values)
2. Sliders can be dragged from any point on the slider (like in iOS Home)
3. Sliders apply live changes to your devices (except turning them off)
2. Explicitly makes it easier to hit 1%

## Installation

### HACS

Mushroom Better Sliders is available in [HACS][hacs] (Home Assistant Community Store).

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Go to "Frontend" section
4. Click button with "+" icon
5. Search for "Mushroom Better Sliders"

### Manual

1. Download repository and build `mushroom.js`. Instructions are in the [original repo][original-repo].
2. Put `mushroom.js` file into your `config/www` folder.
3. Add reference to `mushroom.js` in Dashboard. There's two way to do that:
    - **Using UI:** _Settings_ → _Dashboards_ → _More Options icon_ → _Resources_ → _Add Resource_ → Set _Url_ as `/local/mushroom.js` → Set _Resource type_ as `JavaScript Module`.
      **Note:** If you do not see the Resources menu, you will need to enable _Advanced Mode_ in your _User Profile_
    - **Using YAML:** Add following code to `lovelace` section.
        ```yaml
        resources:
            - url: /local/mushroom.js
              type: module
        ```

### Merging upstream
- git fetch upstream
- git merge vX.X.X (merge release commit)
- resolve conflicts
- run npm i to generate package-lock.json
- npm run start to host
- Edit Dashboard -> Manage Resources 
-> Add hosted "http://192.168.x.x:4000/mushroom.js"
-> Disable current Mushroom (better sliders) resource
-> Reload
- Test
- Create Pull Request


<!-- Badges -->

[hacs-url]: https://github.com/hacs/integration
[hacs-badge]: https://img.shields.io/badge/hacs-default-orange.svg?style=flat-square
[release-badge]: https://img.shields.io/github/v/release/piitaya/lovelace-mushroom?style=flat-square
[downloads-badge]: https://img.shields.io/github/downloads/piitaya/lovelace-mushroom/total?style=flat-square
[build-badge]: https://img.shields.io/github/actions/workflow/status/piitaya/lovelace-mushroom/build.yml?branch=main&style=flat-square

<!-- References -->

[home-assistant]: https://www.home-assistant.io/
[home-assitant-theme-docs]: https://www.home-assistant.io/integrations/frontend/#defining-themes
[hacs]: https://hacs.xyz
[ui-lovelace-minimalist]: https://ui-lovelace-minimalist.github.io/UI/
[button-card]: https://github.com/custom-cards/button-card
[7ahang]: https://www.behance.net/gallery/88433905/Redesign-Smart-Home
[release-url]: https://github.com/piitaya/lovelace-mushroom/releases
