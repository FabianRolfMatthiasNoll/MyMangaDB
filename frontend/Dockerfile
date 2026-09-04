# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

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
