# 🚀 CloudWatchX – DevOps Monitoring & Incident Management Platform

> Production-grade infrastructure monitoring platform built for Cloud & DevOps engineers.

![CloudWatchX](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20RDS-orange)

---

## 📸 Features

| Feature | Description |
|---|---|
| 🖥️ **Infrastructure Monitoring** | CPU, RAM, Disk, Network, Uptime via Prometheus + Node Exporter |
| ⚡ **Real-Time Dashboard** | Live metrics via Socket.IO – no page refresh needed |
| 🚨 **Incident Management** | Auto-generated incidents with severity, status, and timeline |
| 🔔 **Alerting** | Slack, Discord, Email notifications with configurable thresholds |
| ⚙️ **Rules Engine** | Admin-defined monitoring rules evaluated automatically |
| 📊 **Grafana Integration** | Pre-built dashboards for all infrastructure metrics |
| 🔐 **RBAC Auth** | JWT authentication with Admin/Viewer roles |
| 📝 **Audit Logs** | Full activity tracking for compliance |
| 🐳 **Docker Ready** | Single `docker compose up` launches the entire platform |
| ☁️ **AWS Deployment** | EC2 + RDS + automated CI/CD via GitHub Actions |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (Port 80)                     │
│                   Reverse Proxy / LB                     │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
    ┌──────────▼──────────┐  ┌───────▼────────────┐
    │   Next.js Frontend  │  │  Node.js Backend   │
    │     (Port 3000)     │  │    (Port 4000)     │
    └─────────────────────┘  └─────────┬──────────┘
                                        │
              ┌─────────────────────────┼──────────────────┐
              │                         │                   │
    ┌─────────▼──────┐       ┌─────────▼──────┐  ┌────────▼─────┐
    │  PostgreSQL DB  │       │     Redis      │  │  Prometheus  │
    │  (Port 5432)   │       │  (Port 6379)   │  │  (Port 9090) │
    └────────────────┘       └────────────────┘  └──────┬───────┘
                                                          │
                                              ┌───────────▼───────────┐
                                              │   Node Exporter 9100  │
                                              │   Grafana      3001   │
                                              │   Alertmanager 9093   │
                                              └───────────────────────┘
```

---

## 🛠️ Tech Stack

**Frontend:** Next.js 15, TypeScript, Tailwind CSS, Socket.IO Client, React Query, Recharts, Zustand

**Backend:** Node.js, Express, TypeScript, Socket.IO, Prisma ORM, JWT, node-cron

**Database:** PostgreSQL (AWS RDS in production), Redis

**Monitoring:** Prometheus, Grafana, Node Exporter, Alertmanager

**DevOps:** Docker, Docker Compose, GitHub Actions, AWS EC2/RDS, Nginx

---

## ⚡ Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev)
- Git

### 1. Clone & Configure

```bash
git clone https://github.com/YOUR_USERNAME/cloudwatchx.git
cd cloudwatchx
cp .env.example backend/.env
# Edit backend/.env with your values
```

### 2. Launch Everything

```bash
docker compose up -d
```

Wait ~30 seconds for all services to start, then:

```
🌐 App:          http://localhost:3000
📊 Grafana:      http://localhost:3001   (admin/admin123)
📈 Prometheus:   http://localhost:9090
🔔 Alertmanager: http://localhost:9093
🔌 Backend API:  http://localhost:4000
```

### 3. Seed Database

```bash
docker compose exec backend npx ts-node prisma/seed.ts
```

### 4. Login

```
Admin:  admin@cloudwatchx.io / admin123
Viewer: viewer@cloudwatchx.io / viewer123
```

---

## 🖥️ Local Development

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## ☁️ AWS Deployment

### Infrastructure Setup

```
EC2 Instance:    t3.medium (Ubuntu 22.04)
RDS Instance:    db.t3.micro (PostgreSQL 16)
Security Groups: 80, 443, 22, 9090, 3001 (restrict 9090/3001 to VPN)
```

### Deploy

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Run deployment script
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/cloudwatchx/main/scripts/deploy-aws.sh
chmod +x deploy-aws.sh
DOMAIN=monitoring.yourcompany.com EMAIL=you@yourcompany.com ./deploy-aws.sh
```

### GitHub Actions Secrets Required

| Secret | Description |
|---|---|
| `EC2_HOST` | EC2 public IP or domain |
| `EC2_USER` | SSH username (ubuntu) |
| `EC2_SSH_KEY` | Private SSH key content |

---

## 📡 API Reference

### Authentication
```
POST /api/auth/login        { email, password }
POST /api/auth/register     { email, name, password, role }
POST /api/auth/refresh      { refreshToken }
POST /api/auth/logout
GET  /api/auth/me
```

### Servers
```
GET    /api/servers          List all servers
POST   /api/servers          Create server (Admin)
GET    /api/servers/:id      Get server details
PUT    /api/servers/:id      Update server (Admin)
DELETE /api/servers/:id      Delete server (Admin)
GET    /api/servers/:id/metrics  Get server metrics
```

### Incidents
```
GET /api/incidents           List incidents (filterable)
GET /api/incidents/stats     Incident statistics
GET /api/incidents/:id       Incident details
PUT /api/incidents/:id       Update status/assignment (Admin)
POST /api/incidents/:id/timeline  Add timeline note (Admin)
```

### Alerts
```
GET /api/alerts              List alerts
GET /api/alerts/stats        Alert statistics
PUT /api/alerts/:id/acknowledge  Acknowledge alert (Admin)
PUT /api/alerts/:id/resolve      Resolve alert (Admin)
```

### Rules
```
GET    /api/rules            List monitoring rules
POST   /api/rules            Create rule (Admin)
PUT    /api/rules/:id        Update rule (Admin)
DELETE /api/rules/:id        Delete rule (Admin)
```

### Dashboard
```
GET /api/dashboard/overview       Overview stats
GET /api/dashboard/service-health Service health status
```

---

## 📂 Project Structure

```
cloudwatchx/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, JWT config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, error handling
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Logger, metrics
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Demo data seeder
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # API client, store, utils
│   └── Dockerfile
├── monitoring/
│   ├── prometheus/          # Prometheus config + alert rules
│   ├── grafana/             # Grafana dashboards + datasources
│   └── alertmanager/        # Alert routing config
├── nginx/                   # Reverse proxy config
├── scripts/                 # Deployment scripts
├── .github/workflows/       # GitHub Actions CI/CD
└── docker-compose.yml       # Full stack orchestration
```

---

## 🔔 Notification Setup

### Slack
```bash
# In backend/.env:
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx
```

### Discord
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/ID/TOKEN
```

### Email (Gmail)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_google_app_password  # Enable 2FA + App Password
ALERT_EMAIL_TO=oncall@yourcompany.com
```

---

## 📊 Monitoring Rules (Default)

| Metric | Warning | Critical |
|---|---|---|
| CPU | > 80% | > 90% |
| RAM | > 85% | > 95% |
| Disk | > 80% | > 90% |

Admins can create custom rules via the dashboard.

---

## 🔒 Security

- JWT access tokens (15min) + refresh tokens (7 days)
- bcrypt password hashing (salt rounds: 12)
- Helmet.js security headers
- Rate limiting (200 req/15min per IP)
- RBAC: Admin vs Viewer roles
- Input validation on all endpoints
- Environment variable secrets (never committed)

---

## 📈 Resume Bullet Points

- **Architected** a full-stack DevOps monitoring platform using Next.js, Node.js, PostgreSQL, and Redis deployed on AWS EC2 with Docker containerization
- **Implemented** real-time infrastructure monitoring with WebSocket (Socket.IO) delivering live CPU/RAM/Disk metrics to a responsive dashboard
- **Integrated** Prometheus + Grafana + Node Exporter observability stack with custom alerting rules and automated incident generation
- **Built** a multi-channel notification system supporting Slack, Discord, and Email webhooks for critical infrastructure alerts
- **Designed** CI/CD pipeline with GitHub Actions automating test, build, Docker image push to GHCR, and zero-downtime deployment to EC2
- **Implemented** JWT-based authentication with RBAC (Admin/Viewer), refresh tokens, bcrypt hashing, and comprehensive audit logging
- **Configured** Nginx reverse proxy with rate limiting, security headers, and WebSocket support for production traffic routing

---

## 📄 License

MIT © CloudWatchX
