# Build command
# docker build . --no-cache -t launchv0.1

FROM node:12

# Create app directory
RUN mkdir -p /app
RUN mkdir -p /app/src
run mkdir -p /app/src/temp
run mkdir -p /app/src/temp/code
# RUN mkdir -p ~/.aws Used for AWS SQS
WORKDIR /app

# Install app dependenices
COPY ./package.json /app
COPY ./package-lock.json /app
COPY ./jest.config.js /app
RUN npm install 

# Copy code runner file
COPY /src/services/runner.js /app/src/index.js

