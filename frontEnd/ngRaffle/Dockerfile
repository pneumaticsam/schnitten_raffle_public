# Set the base node image as build
FROM node:17.2.0-alpine3.14 as build

# Set the working directory
WORKDIR /app

# copy package.json and install dependencies
COPY package.json package-lock.json ./

RUN npm ci

#Copy the rest of the source code
COPY . .

# build for production
RUN npm run build --prod


# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist/ngRaffle /usr/share/nginx/html

# Expose port 80
EXPOSE 80