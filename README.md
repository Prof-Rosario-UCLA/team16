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

### Production Deployment
1. For frontend and backend, repeat the same steps. We will just describe the steps for the backend deployment.
2. First, build the image: `docker buildx build -t doodly .`
3. To push the image to Google Artifact Registery:
```
gcloud artifacts repositories create REPO_NAME \
  --repository-format=docker \
  --location=us-west1 \
  --description="A nice description"
```
4. Add permissions to your Google Cloud user.
```
gcloud projects add-iam-policy-binding projects/PROJECT_ID \
  --member="user:YOUR_EMAIL@example.com" \
  --role="roles/artifactregistry.writer"
```
5. Authenticate to GAR in the specific region.
```
gcloud auth configure-docker us-west1-docker.pkg.dev
```
6. Push your image to the Google Artifact Repository
```
docker tag doodly \
  us-west1-docker.pkg.dev/PROJECT_ID/REPO_NAME/doodly:v1
docker push \
  us-west1-docker.pkg.dev/PROJECT_ID/REPO_NAME/doodly:v1
```
7. Enable the GKE API: `gcloud services enable container.googleapis.com`
8. Create a GKE cluster. You only need to do this once.
```
gcloud container clusters create YOUR_CLUSTER_NAME \
    --zone YOUR_CLUSTER_ZONE \
    --machine-type e2-small \
    --num-nodes 1
```
9. Install the SDK for Kubernetes (you only need to do this once):
```
gcloud components install kubectl
# Authenticate if needed
gcloud container clusters get-credentials my-node-cluster \
    --zone us-west1-a
```
10. Create a `deployment.yaml` and `service.yaml` in the same format as our `deployment.yaml` and `service.yaml` files,substituting in your env variables and image name.
11. Deploy to the cluster:
```
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```
12. For HTTPS, create a `certificate.yaml` and then apply `kubectl apply -f certificate.yaml`.
13. Create an `ingress.yaml` file, using a similar layout to ours but replacing the URLs, IPs, and certificates with your own.
14. Reuse our `frontendconfig.yaml` and run `kubectl apply -f frontendconfig.yaml`.
15. To enable sockets as well, run `backendconfig.yaml` and run `kubectl -f backendconfig.yaml`.



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





