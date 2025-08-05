#!/bin/bash

# =============================================================================
# User Service - Environment Setup Script
# =============================================================================
# This script sets up the complete development and deployment environment
# for the User Service project including Docker, Kubernetes, Azure CLI, and more.
#
# Usage: chmod +x setup.sh && ./setup.sh
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log_error "Please do not run this script as root"
        exit 1
    fi
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$NAME
            OS_VERSION=$VERSION_ID
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
        OS_VERSION=$(sw_vers -productVersion)
    else
        log_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    log_info "Detected OS: $OS $OS_VERSION"
}

# Update system packages
update_system() {
    log_info "Updating system packages..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        sudo apt update && sudo apt upgrade -y
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        sudo yum update -y || sudo dnf update -y
    elif [[ "$OS" == "macOS" ]]; then
        log_info "macOS detected. Please ensure Homebrew is installed."
        if ! command -v brew &> /dev/null; then
            log_info "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew update
    fi
    
    log_success "System packages updated"
}

# Install Docker
install_docker() {
    if command -v docker &> /dev/null; then
        log_info "Docker is already installed: $(docker --version)"
        return
    fi
    
    log_info "Installing Docker..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # Install Docker on Ubuntu/Debian
        sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io
        
        # Add user to docker group
        sudo usermod -aG docker $USER
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        # Install Docker on CentOS/RHEL/Fedora
        sudo yum install -y yum-utils
        sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        sudo yum install -y docker-ce docker-ce-cli containerd.io
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -aG docker $USER
        
    elif [[ "$OS" == "macOS" ]]; then
        log_info "Please install Docker Desktop for Mac from: https://docs.docker.com/desktop/mac/install/"
        log_warning "Continuing with other installations..."
    fi
    
    log_success "Docker installation completed"
}

# Install kubectl
install_kubectl() {
    if command -v kubectl &> /dev/null; then
        log_info "kubectl is already installed: $(kubectl version --client --short 2>/dev/null || kubectl version --client)"
        return
    fi
    
    log_info "Installing kubectl..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # Download latest stable kubectl
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
        rm kubectl
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        # Download latest stable kubectl
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
        rm kubectl
        
    elif [[ "$OS" == "macOS" ]]; then
        brew install kubectl
    fi
    
    log_success "kubectl installation completed"
}

# Install Azure CLI
install_azure_cli() {
    if command -v az &> /dev/null; then
        log_info "Azure CLI is already installed: $(az version --query '\"azure-cli\"' -o tsv)"
        return
    fi
    
    log_info "Installing Azure CLI..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # Install prerequisites
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl apt-transport-https lsb-release gnupg
        
        # Add Microsoft GPG key
        curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null
        
        # Add Azure CLI repository
        AZ_REPO=$(lsb_release -cs)
        echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | sudo tee /etc/apt/sources.list.d/azure-cli.list
        
        # Update and install Azure CLI
        sudo apt-get update
        sudo apt-get install -y azure-cli
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
        echo -e "[azure-cli]
name=Azure CLI
baseurl=https://packages.microsoft.com/yumrepos/azure-cli
enabled=1
gpgcheck=1
gpgkey=https://packages.microsoft.com/keys/microsoft.asc" | sudo tee /etc/yum.repos.d/azure-cli.repo
        sudo yum install -y azure-cli
        
    elif [[ "$OS" == "macOS" ]]; then
        brew install azure-cli
    fi
    
    log_success "Azure CLI installation completed"
}

# Install Java 11
install_java() {
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1-2)
        log_info "Java is already installed: $(java -version 2>&1 | head -n 1)"
        if [[ "$JAVA_VERSION" == "11"* ]] || [[ "$JAVA_VERSION" == "1.8"* ]] || [[ "$JAVA_VERSION" > "11" ]]; then
            return
        fi
    fi
    
    log_info "Installing Java 11..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        sudo apt install -y openjdk-11-jdk
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        sudo yum install -y java-11-openjdk-devel
        
    elif [[ "$OS" == "macOS" ]]; then
        brew install openjdk@11
    fi
    
    log_success "Java 11 installation completed"
}

# Install Maven
install_maven() {
    if command -v mvn &> /dev/null; then
        log_info "Maven is already installed: $(mvn -version | head -n 1)"
        return
    fi
    
    log_info "Installing Maven..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        sudo apt install -y maven
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        sudo yum install -y maven
        
    elif [[ "$OS" == "macOS" ]]; then
        brew install maven
    fi
    
    log_success "Maven installation completed"
}

# Install Git (if not already installed)
install_git() {
    if command -v git &> /dev/null; then
        log_info "Git is already installed: $(git --version)"
        return
    fi
    
    log_info "Installing Git..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        sudo apt install -y git
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        sudo yum install -y git
        
    elif [[ "$OS" == "macOS" ]]; then
        # Git is usually pre-installed on macOS
        log_info "Git should be available on macOS"
    fi
    
    log_success "Git installation completed"
}

# Install curl and other utilities
install_utilities() {
    log_info "Installing essential utilities..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        sudo apt install -y curl wget jq unzip
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        sudo yum install -y curl wget jq unzip
        
    elif [[ "$OS" == "macOS" ]]; then
        brew install curl wget jq
    fi
    
    log_success "Essential utilities installation completed"
}

# Setup environment file
setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f "User/.env" ]; then
        cp User/.env.example User/.env
        log_info "Created .env file from template. Please update with your actual values:"
        log_warning "  - GOOGLE_CLIENT_SECRET: Your Google OAuth client secret"
        log_warning "  - DATABASE_PASSWORD: Your database password"
        log_warning "  - JWT_SECRET: A secure random string for JWT signing"
    fi
    
    log_success "Environment configuration completed"
}

# Verify installations
verify_installations() {
    log_info "Verifying installations..."
    
    local failed=0
    
    # Check Docker
    if command -v docker &> /dev/null; then
        log_success "✓ Docker: $(docker --version)"
    else
        log_error "✗ Docker installation failed"
        failed=1
    fi
    
    # Check kubectl
    if command -v kubectl &> /dev/null; then
        log_success "✓ kubectl: $(kubectl version --client --short 2>/dev/null || kubectl version --client)"
    else
        log_error "✗ kubectl installation failed"
        failed=1
    fi
    
    # Check Azure CLI
    if command -v az &> /dev/null; then
        log_success "✓ Azure CLI: $(az version --query '\"azure-cli\"' -o tsv)"
    else
        log_error "✗ Azure CLI installation failed"
        failed=1
    fi
    
    # Check Java
    if command -v java &> /dev/null; then
        log_success "✓ Java: $(java -version 2>&1 | head -n 1)"
    else
        log_error "✗ Java installation failed"
        failed=1
    fi
    
    # Check Maven
    if command -v mvn &> /dev/null; then
        log_success "✓ Maven: $(mvn -version | head -n 1)"
    else
        log_error "✗ Maven installation failed"
        failed=1
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        log_success "✓ Git: $(git --version)"
    else
        log_error "✗ Git installation failed"
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        log_success "All tools installed successfully!"
        return 0
    else
        log_error "Some installations failed. Please check the errors above."
        return 1
    fi
}

# Print next steps
print_next_steps() {
    echo ""
    echo "=========================================="
    echo "🎉 Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "📋 Next steps:"
    echo ""
    echo "1. 🔑 Configure your environment:"
    echo "   cd User"
    echo "   nano .env  # Update with your actual secrets"
    echo ""
    echo "2. 🏗️ Build the application:"
    echo "   mvn clean package"
    echo ""
    echo "3. 🐳 Build Docker image:"
    echo "   docker build -t your-registry/sangsangplus-user:latest ."
    echo ""
    echo "4. ☁️ Login to Azure (if using AKS):"
    echo "   az login"
    echo "   az aks get-credentials --resource-group YOUR_RG --name YOUR_CLUSTER"
    echo ""
    echo "5. 🚀 Deploy to Kubernetes:"
    echo "   kubectl apply -f k8s/"
    echo ""
    echo "📚 Documentation:"
    echo "   - README.md: Complete setup guide"
    echo "   - .env.example: Environment variables template"
    echo ""
    echo "🔗 Useful links:"
    echo "   - Docker Hub: https://hub.docker.com/r/buildingbite/sangsangplus-user"
    echo "   - Project repo: https://github.com/Jeonneung/user-test"
    echo ""
    if [[ "$OS" != "macOS" ]] && groups $USER | grep -q docker; then
        echo "⚠️  IMPORTANT: Please log out and log back in for Docker group changes to take effect."
    fi
}

# Main execution
main() {
    echo "=========================================="
    echo "🚀 User Service Environment Setup"
    echo "=========================================="
    echo ""
    
    check_root
    detect_os
    
    log_info "Starting environment setup..."
    echo ""
    
    # Install all components
    update_system
    install_utilities
    install_git
    install_docker
    install_java
    install_maven
    install_kubectl
    install_azure_cli
    setup_environment
    
    echo ""
    log_info "Verifying installations..."
    
    if verify_installations; then
        print_next_steps
    else
        log_error "Setup completed with errors. Please check the installation logs above."
        exit 1
    fi
}

# Run main function
main "$@"