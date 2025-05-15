resource "aws_ecs_service" "main" {
  name                = "${var.app_name}-service"
  cluster             = aws_ecs_cluster.main.id
  task_definition     = aws_ecs_task_definition.app.arn
  desired_count       = var.app_count
  launch_type         = "FARGATE"
  scheduling_strategy = "REPLICA"
  
  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.public[*].id
    assign_public_ip = true
  }

  # Ignore changes to the task definition
  lifecycle {
    ignore_changes = [task_definition]
  }

  tags = {
    Name = "${var.app_name}-service"
  }
}