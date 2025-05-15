# Create an auto scaling target for ECS
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 5
  min_capacity       = 0
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Create scaling policy based on ALB request count
resource "aws_appautoscaling_policy" "scale_up" {
  name               = "${var.app_name}-scale-up"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }
}

# Create scaling policy to scale down after inactivity
resource "aws_appautoscaling_policy" "scale_down" {
  name               = "${var.app_name}-scale-down"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 300
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }
}

# CloudWatch alarm to trigger scale up
resource "aws_cloudwatch_metric_alarm" "request_count_high" {
  alarm_name          = "${var.app_name}-request-count-high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "RequestCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 1  # Scale up when there's any request
  alarm_description   = "Scale up when request count is greater than 0"
  alarm_actions       = [aws_appautoscaling_policy.scale_up.arn]
  
  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# CloudWatch alarm to trigger scale down
resource "aws_cloudwatch_metric_alarm" "request_count_low" {
  alarm_name          = "${var.app_name}-request-count-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 5
  metric_name         = "RequestCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 1  # Scale down when there are no requests for 5 minutes
  alarm_description   = "Scale down when request count is 0 for 5 consecutive minutes"
  alarm_actions       = [aws_appautoscaling_policy.scale_down.arn]
  
  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}