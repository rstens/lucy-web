FROM node:10

RUN apt-get -qq update
RUN apt-get -qq install -y curl
RUN npm install -g npm

# set variables
ENV HOME_ROOT=/opt/app-root
ENV HOME=/opt/app-root/src

# create source directory
RUN mkdir -p $HOME

WORKDIR $HOME_ROOT
WORKDIR $HOME

# Bundle app source
COPY ./ .

VOLUME ${HOME}

ENV PATH ${HOME}/node_modules/.bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH

# run the database migrations and start api-mobile in reload mode (will reload on file changes)
CMD [ "npm", "run", "start:migrate:reload" ]
