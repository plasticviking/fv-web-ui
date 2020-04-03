FROM node:10.19.0

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

ENV GIT_DISCOVERY_ACROSS_FILESYSTEM=1

# install and cache app dependencies
COPY frontend/package.json /app/package.json
COPY frontend/package-lock.json /app/package-lock.json
COPY .git /.git
#COPY frontend/build/webpack.common.js /app/build/webpack.common.js
#
#RUN sed -i "s|target: 'http://127.0.0.1:8080'|target: 'http://nuxeo:8080' |g" /app/build/webpack.common.js

RUN apt-get update && apt-get install -y libgl1-mesa-dev

RUN npm ci

EXPOSE 3001

CMD ["npm", "run", "start"]