FROM node:alpine as builder
WORKDIR /app

# Using docker image layers for faster builds
COPY package.json ./
RUN npm i

COPY ./ ./
RUN npm run build


FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the dist from the build step
COPY --from=builder /app/dist /usr/share/nginx/html/

EXPOSE 80

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./env.sh .
COPY .env .

# Make our shell script executable
RUN chmod +x env.sh

# Start Nginx server
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]