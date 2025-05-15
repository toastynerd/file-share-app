# QuickShare Terraform Deployment (No ALB Version)

This directory contains a simplified Terraform configuration to deploy the QuickShare application to AWS ECS Fargate without an Application Load Balancer, reducing the monthly cost significantly.

## Cost Comparison

| Resource | With ALB | Without ALB |
|----------|---------|-------------|
| Application Load Balancer | ~$16.20/month | $0 |
| ECS Fargate | ~$1.94/month (with scale to zero) | ~$1.94/month (with manual scaling) |
| CloudWatch | ~$1.50/month | ~$0.50/month (no scaling alarms) |
| VPC/Network | ~$0.50/month | ~$0.50/month |
| ECR | ~$0.10/month | ~$0.10/month |
| **Total** | **~$18-20/month** | **~$3-5/month** |

## How It Works

Without an ALB, your ECS Fargate tasks will have public IPs assigned directly. Users can connect directly to the Fargate task's public IP. The main differences are:

1. No load balancing between multiple tasks
2. No automatic DNS name (you'll connect via IP address)
3. IP address changes when tasks restart
4. No auto-scaling based on traffic (manual scaling only)

## Prerequisites

1. AWS CLI installed and configured with appropriate credentials
2. Terraform CLI installed (v1.0.0+)
3. Docker installed (for building and pushing the container image)

## Deployment Steps

### 1. Initialize Terraform

```bash
cd terraform/no-alb-version
terraform init
```

### 2. Build and Push Docker Image

Build the Docker image and push it to the ECR repository:

```bash
# Get the ECR repository URL
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $(terraform output -raw ecr_repository_url)

# Build the image
docker build -t quickshare ../../

# Tag the image for ECR
docker tag quickshare:latest $(terraform output -raw ecr_repository_url):latest

# Push the image to ECR
docker push $(terraform output -raw ecr_repository_url):latest
```

### 3. Apply Terraform Configuration

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

### 4. Access the Application

After deployment completes, you can access the application using the public IP of the Fargate task:

```bash
# Get the task public IP
TASK_ARN=$(aws ecs list-tasks --cluster $(terraform output -raw ecs_cluster_name) --service-name $(terraform output -raw ecs_service_name) --query 'taskArns[0]' --output text)
ENI_ID=$(aws ecs describe-tasks --cluster $(terraform output -raw ecs_cluster_name) --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo "Application URL: http://$PUBLIC_IP:5001"
```

## Updating the Application

To update the application:

1. Build a new Docker image
2. Push it to the ECR repository with the same tag (latest)
3. Force a new deployment in ECS:

```bash
aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) --service $(terraform output -raw ecs_service_name) --force-new-deployment
```

## Cleanup

To destroy all resources created by Terraform:

```bash
terraform destroy
```