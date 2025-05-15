output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnets" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "ecr_repository_url" {
  description = "ECR Repository URL for the application"
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.main.name
}

output "ecs_task_definition_family" {
  description = "Family of the ECS task definition"
  value       = aws_ecs_task_definition.app.family
}

output "access_instructions" {
  description = "Instructions to get the Fargate task's public IP"
  value = <<EOF
Run the following commands to get the public IP of your Fargate task:

TASK_ARN=$(aws ecs list-tasks --cluster ${aws_ecs_cluster.main.name} --service-name ${aws_ecs_service.main.name} --query 'taskArns[0]' --output text)
ENI_ID=$(aws ecs describe-tasks --cluster ${aws_ecs_cluster.main.name} --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo "Application URL: http://$PUBLIC_IP:${var.app_port}"
EOF
}