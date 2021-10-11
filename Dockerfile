FROM node:16-alpine as angular
WORKDIR /usr/src/app
COPY package* .
RUN npm install
COPY . .
RUN npm i -g @angular/cli
RUN ng build --configuration=production

FROM nginx
WORKDIR /usr/src/app
COPY --from=angular /usr/src/app/dist/umbrella ./
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
