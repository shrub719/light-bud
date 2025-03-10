# Light Bud: Server

## Documentation

The server uses node.js with express and MongoDB with Mongoose. Instructions below are to run it locally.

### Setup

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

### Routes
The server uses node.js with express to provide several API routes from `index.js`:

#### Users
`routes/users.js`  
The logic for user management and data storage.  

#### Rooms
`routes/rooms.js`  
The logic for room creation and joining.

### Modules

#### Authentication
`db/auth.js`  
Authentication functions used in the users and rooms routes.

#### Database
`db/db.js`  
Basic interface with MongoDB using Mongoose.

### Once it's Running
I recommend using the [Restman](https://chromewebstore.google.com/detail/restman/ihgpcfpkpmdcghlnaofdmjkoemnlijdi) browser extension to test HTTP requests.  
Target `http://localhost:3000/`, replacing `3000` with your chosen port in `.env`.  

To view the database, use MongoDBCompass which came with your installation of MongoDB. <!-- do they have to create the connection? -->  
Alternatively, use the `/users` and `/rooms` endpoints passing in your password from `.env.PASSWORD` in the header as `Key: Bearer <PASSWORD>`.