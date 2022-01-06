# Mushroom Cards

## Development

### Home assistant

You can run a demo instance of Home Assistant with docker by running:

```sh
npm run start:hass
```

Once it's done, go to home assitant instance ([http://localhost:8123](http://localhost:8123)) and start configuration.

### Mushroom

In another terminal, install dependencies and run development server:
```sh
npm i
npm start
```

Server will start on port `5000`. 

### Home assistant configuration

Once both Home Assistant and mushroom are running, you have to add a resource to Home Assistant UI:
- Go on your profile ([http://localhost:8123/profile](http://localhost:8123/profile))
- Enable `Advanced mode`
- Then go to Lovelace resources ([http://localhost:8123/config/lovelace/resources](http://localhost:8123/config/lovelace/resources))
- Add the ressource `http://localhost:5000/mushroom.js`:
  ![Add resource](doc/add_resource.png)
- A showcase dashboard is provided ([http://localhost:8123/lovelace-mushroom-showcase](http://localhost:8123/lovelace-mushroom-showcase))

## Build

```sh
npm run build
```

