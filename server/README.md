# Light Bud: Server

## Documentation

The server uses node.js with express and MongoDB with Mongoose. Instructions below are to run it locally.

### Setup

1. In the `./server` directory, run:  
    ```
    npm install
    ```
1. To test the database, download [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
1. Create a `.env` file and add the following keys:
    ```
    MONGO_URI=mongodb://localhost:27017/light-bud   # if localhost doesn't work, use 0.0.0.0
    PORT=3000   # any valid port
    PASSWORD=abcdef   # any string to be used to get all user data over HTTPS
    ```
1. To start the server in dev mode with hot reloading, run:
    ```
    npm run dev
    ```

### Routes
The server uses node.js with express to provide several API routes from `index.ts`:

#### Users
`routes/users.ts`  
The logic for user management and data storage.

#### Rooms
`routes/rooms.ts`  
The logic for room creation and joining.

### Modules

#### Authentication
`utils/auth.ts`  
Authentication functions used in the users and rooms routes.

#### Database
`utils/db.ts`  
Basic interface with MongoDB using Mongoose.

#### Limiters
`utils/limiters.ts`  
Rate limit and slowdown middleware used in other routes.

### Once it's Running
I recommend using the [Restman](https://chromewebstore.google.com/detail/restman/ihgpcfpkpmdcghlnaofdmjkoemnlijdi) browser extension to test HTTP requests.  
Target `http://localhost:3000/`, replacing `3000` with your chosen port in `.env`.  

To view the database, use MongoDBCompass which came with your installation of MongoDB. <!-- do they have to create the connection? -->  
Alternatively, use the `api/users` and `api/rooms` endpoints passing in your password from `.env.PASSWORD` in the header as `Authentication: Bearer <PASSWORD>`.