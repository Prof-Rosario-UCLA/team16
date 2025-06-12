# doodly

## Description
**doodly** is a real-time, multiplayer drawing game based on Pictionary. Each round, one player will be prompted to draw a word while the other players will have to guess the word via a live chat system. Points are awarded based on how fast the player can guess the word. At the end, the player with the most points is crowned the **Master Doodler**. 

## Tech Stack
The project is implemented using a typical MERN (**M**ongoDB, **E**xpress, **R**eact, **N**ode.js) stack along with Socket.io to create the real-time drawing canvas.

## Deployment

### Local Deployment

```bash
# Clone the repository
git clone https://github.com/Prof-Rosario-UCLA/team16.git
cd team16

# Create env file with MongoURI, Cookie Secret, JWT Secret

# Start the backend
cd backend
npm install
npm run dev

# Start the frontend
cd frontend
npm install
npm run dev
```

### Production Depoyment
> TODO

## API Endpoints
All endpoints are accessible under `/api`.

### Routes
#### Game Routes
`POST /api/game` - generates a new game with a random gameId

#### Leaderboard Routes
`GET /api/leaderboard` - fetches top 10 players based on wins, games, and points

#### Login Routes
`POST /api/login` - takes in a username and password that registers a new user and saves them in the database

`POST /api/login/session` - takes in a username and password, returning a JWT session token within a cookie if the login is successful

`DELETE /api/login/session` - log outs user by clearing the session cookie

#### User Routes
`GET /api/user/me` - returns the current logged in user or `null` if nobody is logged in

`GET /api/:username/stats` - returns the wins, point, and games for each user along with their placement in each category

#### Testing Routes
`GET /api/test` - test route that returns a Test object

`GET /` - special route that we use to ping the backend and check for connectivity





