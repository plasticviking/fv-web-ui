#FROM node:10.19.0
#
## set working directory
#WORKDIR /app
#
## add `/app/node_modules/.bin` to $PATH
#ENV PATH /app/node_modules/.bin:$PATH
#
#ENV GIT_DISCOVERY_ACROSS_FILESYSTEM=1
#
## install and cache app dependencies
#COPY frontend/package.json /app/package.json
#COPY frontend/package-lock.json /app/package-lock.json
#COPY .git /.git
##COPY frontend/build/webpack.common.js /app/build/webpack.common.js
##
##RUN sed -i "s|target: 'http://127.0.0.1:8080'|target: 'http://nuxeo:8080' |g" /app/build/webpack.common.js
#
#RUN apt-get update && apt-get install -y libgl1-mesa-dev
#
#RUN npm ci
#RUN npm run cy:trashCopy && npm run cy:copy
#
#EXPOSE 3001
#
#CMD ["npm", "run", "start"]

FROM node:10.19.0 AS build

WORKDIR /app
#ENV PATH /app/node_modules/.bin:$PATH
ENV GIT_DISCOVERY_ACROSS_FILESYSTEM=1
COPY frontend /app
COPY .git /.git
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
        perl \
        git \
        anacron \
        locales \
        pwgen \
        imagemagick \
        ffmpeg2theora \
        ufraw \
        poppler-utils \
        libwpd-tools \
        exiftool \
        ghostscript \
        libreoffice \
        apache2 \
        libtcnative-1 \
        ffmpeg \
        gnupg2 \
        ca-certificates \
        wget \
        x264 &&\
        apt remove -y libtcnative-1

#RUN npm install -g --unsafe-perm cypress
RUN npm ci
RUN npm run build:production

COPY 000-default.conf /000-default.conf
CMD ["npm", "run", "start"]

#FROM httpd:2.4
#WORKDIR /app
#COPY --from=build /app/public /usr/local/apache2/htdocs/
##COPY frontend/public /usr/local/apache2/htdocs/
#
#COPY 000-default.conf /usr/local/apache2/conf/000-default.conf