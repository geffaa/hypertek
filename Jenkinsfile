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

        // NVM & Node 22 paths (isolated for this pipeline)
        NVM_DIR = "/var/lib/jenkins/.nvm"
        NODE_VERSION = "22.20.0"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📦 Checking out source code...'
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
                echo "📁 Preparing deployment directory: ${DEPLOY_DIR}"
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
                echo '⚙️ Building frontend...'
                sh '''
                    export NVM_DIR="${NVM_DIR}"
                    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

                    nvm install $NODE_VERSION
                    nvm use $NODE_VERSION
                    export PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

                    node -v
                    npm -v

                    cd $FRONTEND_DIR
                    npm install --legacy-peer-deps --silent
                    npm run build
                '''
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo '🛠 Installing backend dependencies...'
                sh """
                    cd $BACKEND_DIR
                    npm install --legacy-peer-deps --silent
                """
            }
        }

        stage('Backup Current Deployment') {
            steps {
                echo "📦 Backing up current deployment to: ${BACKUP_DIR}"
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
                echo "🚀 Deploying frontend to Nginx web root: ${FRONTEND_WEB_ROOT}"
                sh """
                    sudo mkdir -p $FRONTEND_WEB_ROOT
                    sudo rm -rf $FRONTEND_WEB_ROOT/*
                    sudo cp -r $FRONTEND_DIR/dist/* $FRONTEND_WEB_ROOT/
                """
            }
        }

        stage('Restart Backend') {
            steps {
                echo "🔄 Restarting backend process on port $BACKEND_PORT"
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
                echo '🔄 Restarting Nginx'
                sh "sudo systemctl restart nginx"
            }
        }
    }

    post {
        success {
            echo "✅ Hyper-Tek Game deployed successfully!"
        }
        failure {
            echo "❌ Deployment failed. Check Jenkins logs for details."
        }
    }
}
