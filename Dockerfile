FROM node:18-alpine

WORKDIR /monitoring_app

COPY . .

#To set up the Node.js environment
RUN npm install
EXPOSE 3000


CMD ["npm", "start"]

