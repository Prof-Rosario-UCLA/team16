FROM node:lts-alpine

# install rust
# RUN apk add --no-cache curl build-base \
#   && curl https://sh.rustup.rs -sSf | sh -s -- -y \
#   && . "$HOME/.cargo/env" \

WORKDIR /app

# install deps
COPY package*.json ./
# needed for wasm build during npm install
COPY wasm ./wasm
RUN npm install

# copy source
COPY . .

# build
RUN npm run build

# # can't do this earlier because build needs dev dependencies
# ENV NODE_ENV=production

EXPOSE 3000

# start app
CMD ["npm", "start"]