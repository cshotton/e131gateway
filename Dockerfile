FROM node:12-alpine
RUN apk --no-cache add curl
ADD . /project
RUN rm -rf /project/node_modules
WORKDIR /project
RUN cd /project \
	&& npm install
EXPOSE 3131
CMD npm start