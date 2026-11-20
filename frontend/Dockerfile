# syntax=docker/dockerfile:1

# Build stage.
# Not alpine on purpose: the musl build of rolldown (which vite 8 uses) fails
# to resolve the source map paths and the build dies with
# "The paths[1] argument must be of type string". The glibc build works.
FROM node:24-slim AS build

WORKDIR /app

COPY package*.json ./
# `npm ci` installs exactly the locked versions, and the cache mount keeps
# the downloaded packages between builds.
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

# Left unset by default so the bundle uses same-origin requests.
ARG VITE_API_URL=""

ENV VITE_API_URL=$VITE_API_URL

# Remove any existing .env file to ensure build args take precedence
RUN rm -f .env

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
# Rendered by the nginx entrypoint so BACKEND_URL can be set per deployment.
COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV BACKEND_URL=http://backend:8000

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
