FROM node:14-alpine
LABEL maintainer=reruin

ADD . /netdrive/
WORKDIR /netdrive
VOLUME /netdrive/cache
VOLUME /netdrive/theme
VOLUME /netdrive/plugin

RUN npm install --production

ENV HOST 0.0.0.0
ENV PORT 33001

EXPOSE 33001

CMD ["npm", "start"]