# Zentra Banking Platform — Deployment Guide

## Prerequisites

- **Docker Engine** 24+ and Docker Compose v2
- **Git** for cloning the repository
- **AWS Account** with EC2 access (for production deployment)
- **GitHub Account** (for CI/CD)

---

## Local Development (Docker)

The fastest way to run the full stack:

```bash
# Clone the repository
git clone https://github.com/theacceleratorproject/zentra-platform.git
cd zentra-platform

# Configure environment
cp .env.example .env

# Build and start all services
docker compose up --build
```

**Access points:**
| Service | URL |
|---------|-----|
| Dashboard | http://localhost |
| API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

**Useful commands:**
```bash
# Run in background
docker compose up -d --build

# View logs
docker compose logs -f api
docker compose logs -f frontend

# Stop all services
docker compose down

# Rebuild a single service
docker compose build api
docker compose up -d api
```

---

## Local Development (Codespaces / Native)

For development without Docker, use GitHub Codespaces:

1. Open the repo in GitHub Codespaces
2. Wait for the devcontainer to auto-configure (~2 minutes)
3. Start the API:
   ```bash
   pip install -r src/api/requirements.txt
   uvicorn src.api.main:app --reload --port 8000
   ```
4. Start the frontend (new terminal):
   ```bash
   cd src/frontend
   npm install
   npm run dev
   ```

---

## AWS EC2 Deployment

### Step 1: Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Configure:
   - **AMI:** Amazon Linux 2023 or Ubuntu 22.04
   - **Instance type:** `t3.small` (2 vCPU, 2GB RAM — sufficient for demo/portfolio)
   - **Storage:** 20GB gp3
   - **Security group:** Allow inbound on:
     - Port 22 (SSH)
     - Port 80 (HTTP)
     - Port 443 (HTTPS — optional)
   - **Key pair:** Create or select an SSH key pair

3. Note the **Public IP** or **Elastic IP** after launch

### Step 2: Install Docker on EC2

SSH into your instance:

```bash
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>
```

**Amazon Linux 2023:**
```bash
# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Install git
sudo yum install -y git

# Log out and back in for group changes
exit
```

**Ubuntu 22.04:**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
exit
```

### Step 3: Clone and Deploy

```bash
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

# Create application directory
sudo mkdir -p /opt/zentra
sudo chown ec2-user:ec2-user /opt/zentra
cd /opt/zentra

# Clone the repository
git clone https://github.com/theacceleratorproject/zentra-platform.git .

# Configure environment
cp .env.example .env
# Edit with production values:
# ALLOWED_ORIGINS=http://<your-domain-or-ip>
# FRONTEND_PORT=80

# Build and start
docker compose up -d --build
```

### Step 4: Verify Deployment

```bash
# Check container status
docker compose ps

# Test API health
curl http://localhost:8000/health

# Test frontend (through nginx)
curl -s http://localhost/ | head -5

# View logs
docker compose logs -f
```

Access from your browser: `http://<EC2_PUBLIC_IP>`

### Step 5: Configure GitHub Actions Secrets

To enable automated deployments, add these secrets to your GitHub repository:

1. Go to **Settings → Secrets and variables → Actions**
2. Add the following repository secrets:

| Secret | Value |
|--------|-------|
| `EC2_HOST` | Your EC2 public IP or domain |
| `EC2_USER` | `ec2-user` (Amazon Linux) or `ubuntu` (Ubuntu) |
| `EC2_SSH_KEY` | Contents of your `.pem` private key file |

3. Create a **production** environment:
   - Go to **Settings → Environments → New environment**
   - Name: `production`
   - Add any required reviewers (optional)

Now every push to `main` will automatically deploy to your EC2 instance.

### Step 6: HTTPS with Let's Encrypt (Optional)

For production HTTPS:

```bash
# Install certbot
sudo yum install -y certbot  # Amazon Linux
# OR
sudo apt-get install -y certbot  # Ubuntu

# Obtain certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com

# Update nginx config in docker/frontend/nginx.conf to use SSL
# Then rebuild: docker compose up -d --build frontend
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ZENTRA_ENV` | `production` | Deployment mode |
| `API_PORT` | `8000` | API container port mapping |
| `FRONTEND_PORT` | `80` | Frontend container port mapping |
| `ALLOWED_ORIGINS` | `http://localhost,http://localhost:3000` | CORS allowed origins (comma-separated) |

---

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker compose logs api
docker compose logs frontend

# Verify images built correctly
docker images | grep zentra
```

### API health check fails
```bash
# Check if COBOL is available inside the container
docker compose exec api cobc --version

# Check if binaries compiled
docker compose exec api ls -la data/output/
```

### Frontend shows blank page
```bash
# Check nginx logs
docker compose logs frontend

# Verify built files exist
docker compose exec frontend ls /usr/share/nginx/html/
```

### Data files not persisting
```bash
# Check volume
docker volume inspect zentra_zentra-output

# Backup output data
docker compose cp api:/app/data/output ./backup/
```

### COBOL compilation errors in container
```bash
# Enter the API container
docker compose exec api bash

# Try manual compilation
cobc -x -I src/cobol/utils -o data/output/TEST src/cobol/core/HELLO.cbl
./data/output/TEST
```

---

## Maintenance

### Updating the Application

```bash
cd /opt/zentra
git pull origin main
docker compose up -d --build
```

### Backing Up Data

```bash
# Copy output files from container
docker compose cp api:/app/data/output ./backup/$(date +%Y%m%d)/
```

### Monitoring

```bash
# Container status
docker compose ps

# Resource usage
docker stats

# API health
curl http://localhost:8000/health
```

### Scaling (Future)

The current architecture runs both services on a single host with Docker Compose. For higher availability:

- **AWS ECS / Fargate** — Run containers as managed services
- **Load Balancer** — Add ALB in front of the frontend container
- **RDS** — Migrate flat files to PostgreSQL for concurrent access
- **CloudWatch** — Add monitoring and alerting
