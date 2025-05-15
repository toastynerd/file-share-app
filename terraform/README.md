# QuickShare Terraform Deployment

This directory contains Terraform configuration to deploy the QuickShare application to AWS ECS Fargate.

## Prerequisites

1. AWS CLI installed and configured with appropriate credentials
2. Terraform CLI installed (v1.0.0+)
3. Docker installed (for building and pushing the container image)

## Deployment Steps

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Build and Push Docker Image

Build the Docker image and push it to the ECR repository (you will need to do this after creating the ECR repository):

```bash
# Get the ECR repository URL
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $(terraform output -raw ecr_repository_url)

# Build the image
docker build -t quickshare ../

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

After deployment completes, you can access the application using the URL provided in the outputs:

```bash
echo "Application URL: $(terraform output -raw app_url)"
```

## Making Updates

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

**Note**: This will delete all resources including the ECR repository, which will delete all container images stored in it.

## Configuration

You can modify the following variables in `variables.tf` to customize the deployment:

- `aws_region`: AWS region to deploy resources (default: us-west-2)
- `app_name`: Name of the application (default: quickshare)
- `app_port`: Port the application listens on (default: 5001)
- `app_count`: Number of application containers to run (default: 1)
- `fargate_cpu`: CPU units for Fargate tasks (default: 256)
- `fargate_memory`: Memory for Fargate tasks (default: 512)
- `vpc_cidr`: CIDR block for the VPC (default: 10.0.0.0/16)
- `availability_zones`: List of availability zones to use (default: ["us-west-2a", "us-west-2b"])