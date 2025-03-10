# Light Bud
Productivity pet that lives in your browser. This rewrite is currently in progress, see the legacy version [here](https://github.com/shrub719/light-bud-legacy).

## How to Contribute

Fork and clone this repository to start working.

### Server

1. In the `/server` directory, run:  
    ```
    npm install
    ```
1. To test the database, download [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
1. Create a `.env` file in `/server`, and add the following keys:
    ```
    MONGO_URI=mongodb://localhost:27017/light-bud   # if localhost doesn't work, use 0.0.0.0
    PORT=3000   # any valid port
    PASSWORD=abcdef   # any string to be used to get all user data over HTTPS
    ```
1. To start the server, run:
    ```
    npm start
    ```
I recommend using the [Restman](https://chromewebstore.google.com/detail/restman/ihgpcfpkpmdcghlnaofdmjkoemnlijdi) browser extension to test HTTP requests.


### Extension

1. In the `/extension` directory, run:
    ```
    npm install
    ```
1. To start a dev session and open up a browser with the extension added and hot reload enabled, run:
    ```
    npm run dev
    ```