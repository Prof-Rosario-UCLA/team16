## Installation

To run the development server:
`npm install` followed by `npm run dev`

The backend will be accessible at [localhost:3001](localhost:3001). Test it out at [localhost:3001/api/ping](localhost:3001/api/ping).

### Docker

First, build the container with `docker buildx build -t doodly .`

Run it with `docker run -d -p 3001:3001 doodly`.
