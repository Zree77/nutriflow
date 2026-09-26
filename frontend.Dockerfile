# NutriFlow frontend (React/Vite) container image
# Vite bakes import.meta.env.* values into the JS bundle at BUILD time,
# so the backend URL must be supplied as a build arg here, not as a
# Kubernetes env var on the running pod.

FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

# Must point at wherever the backend is externally reachable from the
# browser (the ALB/Ingress host) -- not a cluster-internal DNS name.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---- serve stage ----
FROM nginx:1.27-alpine AS serve

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

