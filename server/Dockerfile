# Build command
# docker build . --no-cache -t launchv0.1

FROM node:8

# Create app directory
RUN mkdir -p /user/src/app
# RUN mkdir -p ~/.aws Used for AWS SQS
WORKDIR /user/src/app

# Install app dependenices
COPY /launcher/package.json /user/src/app
COPY /launcher/package-lock.json /user/src/app
RUN npm install

# Copy app src
COPY /launcher/index.js /user/src/app

EXPOSE 3000
CMD ["npm", "start"]

