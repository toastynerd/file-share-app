resource "aws_ecr_repository" "app" {
  name                 = var.app_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.app_name}-ecr"
  }
}

# Output the ECR repository URL for easy access
output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}