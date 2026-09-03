# SAAHAJ Production Deployment Runbook

## 1. Prerequisites
- Docker Engine 24.0+
- Node.js 20.x LTS
- Google Cloud SDK (`gcloud`) if deploying to Cloud Run
- Valid Gemini API Key configured in runtime environment

## 2. Local Production Build & Run
```bash
# 1. Install dependencies
npm ci

# 2. Compile Vite client and Node server bundle
npm run build

# 3. Launch production server
npm run start
```

## 3. Docker Deployment
```bash
# Build production container
docker build -t saahaj:v10 .

# Run container on port 3000
docker run -p 3000:3000 -e GEMINI_API_KEY="your-api-key" saahaj:v10
```

## 4. Health Probes
- **Liveness Probe**: `GET http://localhost:3000/health/live` -> Returns HTTP 200 `{ status: "live" }`
- **Readiness Probe**: `GET http://localhost:3000/health/ready` -> Returns HTTP 200 with subsystem health telemetry
