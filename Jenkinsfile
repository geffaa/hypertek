pipeline {
    agent any
    environment {
        // Deployment directories
        DEPLOY_DIR = "/var/www/hyper-tek-game"
        FRONTEND_DIR = "${DEPLOY_DIR}/frontend"
        BACKEND_DIR = "${DEPLOY_DIR}/backend"
        FRONTEND_WEB_ROOT = "/usr/share/nginx/html/hyper-tekgame"
        BACKEND_PORT = "3000"  // backend port
        BACKUP_DIR = "/var/backups/nginx-site-hypertek"
    }
    stages {
        stage('Checkout') {
            steps {
                echo ':package: Checking out source code...'
                checkout scmGit(
                    branches: [[name: '*/main']],
                    extensions: [],
                    userRemoteConfigs: [[
                        credentialsId: 'abdul_git_repo_credentials',
                        url: 'https://github.com/deventialimited/hyper-tek-game-web.git'
                    ]]
                )
            }
        }
        stage('Prepare Deployment Directory') {
            steps {
                echo ":file_folder: Preparing deployment directory: ${DEPLOY_DIR}"
                sh """
                    sudo rm -rf $DEPLOY_DIR
                    sudo mkdir -p $DEPLOY_DIR
                    sudo cp -r . $DEPLOY_DIR
                    sudo chown -R \$(whoami):\$(whoami) $DEPLOY_DIR
                """
            }
        }
        stage('Build Frontend') {
            steps {
                echo ':gear: Building frontend...'
                sh """
                    node -v
                    npm -v
                    cd $FRONTEND_DIR
                    npm install --legacy-peer-deps --silent
                    npm run build
                """
            }
        }
        stage('Install Backend Dependencies') {
            steps {
                echo ':hammer_and_wrench: Installing backend dependencies...'
                sh """
                    cd $BACKEND_DIR
                    npm install --legacy-peer-deps --silent
                """
            }
        }
        stage('Backup Current Deployment') {
            steps {
                echo ":package: Backing up current deployment to: ${BACKUP_DIR}"
                sh """
                    sudo mkdir -p $BACKUP_DIR
                    sudo rm -rf $BACKUP_DIR/*
                    if [ -d "$FRONTEND_WEB_ROOT" ] && [ "\$(ls -A $FRONTEND_WEB_ROOT)" ]; then
                        echo "Backing up frontend..."
                        sudo cp -r $FRONTEND_WEB_ROOT/* $BACKUP_DIR/
                    fi
                """
            }
        }
        stage('Deploy Frontend') {
            steps {
                echo ":rocket: Deploying frontend to Nginx web root: ${FRONTEND_WEB_ROOT}"
                sh """
                    sudo mkdir -p $FRONTEND_WEB_ROOT
                    sudo rm -rf $FRONTEND_WEB_ROOT/*
                    sudo cp -r $FRONTEND_DIR/dist/* $FRONTEND_WEB_ROOT/
                """
            }
        }
        stage('Restart Backend') {
            steps {
                echo ":arrows_counterclockwise: Restarting backend process on port $BACKEND_PORT"
                sh """
                    if pm2 list | grep -q 'hyper-tek-backend'; then
                        pm2 restart hyper-tek-backend
                    else
                        pm2 start $BACKEND_DIR/index.js --name hyper-tek-backend --watch --port $BACKEND_PORT
                    fi
                """
            }
        }
        stage('Restart Nginx') {
            steps {
                echo ':arrows_counterclockwise: Restarting Nginx'
                sh "sudo systemctl restart nginx"
            }
        }
    }
    post {
        success {
            echo ":white_check_mark: Hyper-Tek Game deployed successfully!"
        }
        failure {
            echo ":x: Deployment failed. Check Jenkins logs for details."
        }
    }
}