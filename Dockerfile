FROM node:12-alpine
ADD . /project
RUN rm -rf /project/node_modules
WORKDIR /project
RUN cd /project \
	&& npm install
EXPOSE 3000
CMD npm start