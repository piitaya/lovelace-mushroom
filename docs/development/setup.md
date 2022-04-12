---
title: Setup
hide:
  - toc
---

### Home assistant demo

You can run a demo instance of Home Assistant with docker by running:

```sh
npm run start:hass
```

Once it's done, go to home assitant instance [http://localhost:8123](http://localhost:8123) and start configuration.

### Development

In another terminal, install dependencies and run development server:

```sh
npm install
npm start
```

Server will start on port `5000`.

### Home assistant configuration

Once both Home Assistant and mushroom are running, you have to add a resource to Home Assistant UI:

-   Go on your profile
-   Enable `Advanced mode`
-   Then go to Lovelace resources
-   Add the ressource `http://localhost:5000/mushroom.js`:

    _Configuration_ → _Lovelace Dashboards_ → _Resources Tab_ → Click Plus button → Set _Url_ as `http://localhost:5000/mushroom.js` → Set _Resource type_ as `JavaScript Module`.

### Build

You can build the `mushroom.js` file in `dist` folder by running the build command.

```sh
npm run build
```