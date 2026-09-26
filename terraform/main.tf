terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

# ---------------------------------------------------------
# VPC
# ---------------------------------------------------------

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "6.7.3"

  name = "nutriflow-vpc"
  cidr = "10.0.0.0/16"

  azs = [
    "ap-south-1a",
    "ap-south-1b"
  ]

  private_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]

  public_subnets = [
    "10.0.101.0/24",
    "10.0.102.0/24"
  ]

  enable_nat_gateway = true
  single_nat_gateway = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }

  tags = {
    Project     = "NutriFlow"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

# ---------------------------------------------------------
# EKS Cluster
# ---------------------------------------------------------

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.26.0"

  name               = "nutriflow-eks"
  kubernetes_version = "1.33"

  # -------------------------------------------------------
  # Networking
  # -------------------------------------------------------

  vpc_id = module.vpc.vpc_id

  subnet_ids = module.vpc.private_subnets

  control_plane_subnet_ids = module.vpc.private_subnets

  # -------------------------------------------------------
  # API endpoint
  # -------------------------------------------------------

  endpoint_public_access  = true
  endpoint_private_access = true

  # -------------------------------------------------------
  # IAM / Access
  # -------------------------------------------------------

  enable_irsa = true

  enable_cluster_creator_admin_permissions = true

  authentication_mode = "API_AND_CONFIG_MAP"

  # -------------------------------------------------------
  # Cluster security group
  # -------------------------------------------------------

  security_group_additional_rules = {
    ingress_nodes_443 = {
      description                = "Node groups to EKS cluster API"
      protocol                   = "tcp"
      from_port                  = 443
      to_port                    = 443
      type                       = "ingress"
      source_node_security_group = true
    }
  }

  # -------------------------------------------------------
  # EKS Add-ons
  # -------------------------------------------------------
  # before_compute = true forces vpc-cni, kube-proxy, and
  # eks-pod-identity-agent to be created BEFORE the managed
  # node group, breaking the circular dependency where the
  # node group waits on a working CNI that itself was waiting
  # on the node group to exist first.
  # coredns is left without before_compute since its pods
  # need schedulable nodes to actually run on.
  # -------------------------------------------------------

  addons = {
    vpc-cni = {
      most_recent    = true
      before_compute = true
    }

    kube-proxy = {
      most_recent    = true
      before_compute = true
    }

    coredns = {
      most_recent = true
    }

    eks-pod-identity-agent = {
      most_recent    = true
      before_compute = true
    }
  }

  # -------------------------------------------------------
  # Managed Node Group
  # -------------------------------------------------------

  eks_managed_node_groups = {
    nutriflow_nodes = {
      name = "nutriflow-node-group"

      ami_type       = "AL2023_x86_64_STANDARD"
      instance_types = ["t3.medium"]

      capacity_type = "ON_DEMAND"

      min_size     = 2
      max_size     = 3
      desired_size = 2

      disk_size = 20

      subnet_ids = module.vpc.private_subnets

      # ---------------------------------------------------
      # Node labels
      # ---------------------------------------------------

      labels = {
        Project = "NutriFlow"
      }

      # ---------------------------------------------------
      # Node tags
      # ---------------------------------------------------

      tags = {
        Project     = "NutriFlow"
        Environment = "dev"
        ManagedBy   = "Terraform"
      }
    }
  }

  tags = {
    Project     = "NutriFlow"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

# ---------------------------------------------------------
# ECR - Frontend
# ---------------------------------------------------------

resource "aws_ecr_repository" "frontend" {
  name                 = "nutriflow-frontend"
  image_tag_mutability = "MUTABLE"

  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project     = "NutriFlow"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

# ---------------------------------------------------------
# ECR - Backend
# ---------------------------------------------------------

resource "aws_ecr_repository" "backend" {
  name                 = "nutriflow-backend"
  image_tag_mutability = "MUTABLE"

  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project     = "NutriFlow"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

# ---------------------------------------------------------
# Outputs
# ---------------------------------------------------------

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_version" {
  description = "EKS Kubernetes version"
  value       = module.eks.cluster_version
}

output "frontend_ecr_repository_url" {
  description = "Frontend ECR repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr_repository_url" {
  description = "Backend ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}
