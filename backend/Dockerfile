FROM node:lts-alpine
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm install

# copy source
COPY . .

# build
RUN npm run build

# can't do this earlier because build needs dev dependencies
ENV NODE_ENV=production

EXPOSE 3001

# start app
CMD ["npm", "start"]