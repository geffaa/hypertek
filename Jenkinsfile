pipeline {
    agent any

    environment {
        DEPLOY_DIR = "/var/www/hyper-tek-game"
        FRONTEND_DIR = "${DEPLOY_DIR}/frontend"
        BACKEND_DIR = "${DEPLOY_DIR}/backend"
        WEB_ROOT = "/usr/share/nginx/html/hyper-tekgame"
        BACKUP_DIR = "/var/backups/nginx-site-hypertekgame"
        BUILD_TAG = "build-${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📦 Checking out source code...'
                checkout scmGit(
                    branches: [[name: '*/main']],
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
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm install 22
            nvm use 22
            cd $FRONTEND_DIR
            npm install --legacy-peer-deps --silent
            npm run build
        '''
    }
}


        stage('Install Backend Dependencies') {
            steps {
                echo '⚙️ Installing backend dependencies...'
                sh """
                    cd $BACKEND_DIR
                    npm install --silent
                    # If you use PM2 or have a backend build step, include here
                """
            }
        }

        stage('Backup Current Deployment') {
            steps {
                echo "🗂️ Backing up current deployment to: ${BACKUP_DIR}"
                sh """
                    sudo mkdir -p $BACKUP_DIR
                    sudo rm -rf $BACKUP_DIR/*
                    if [ -d "$WEB_ROOT" ] && [ "\$(ls -A $WEB_ROOT)" ]; then
                        echo "Found existing frontend deployment, backing up..."
                        sudo cp -r $WEB_ROOT/* $BACKUP_DIR/
                    else
                        echo "No existing frontend found, skipping backup."
                    fi
                """
            }
        }

        stage('Deploy Frontend') {
            steps {
                echo "🚀 Deploying frontend to Nginx web root: ${WEB_ROOT}"
                sh """
                    sudo mkdir -p $WEB_ROOT
                    sudo rm -rf $WEB_ROOT/*
                    sudo cp -r $FRONTEND_DIR/build/* $WEB_ROOT/
                """
            }
        }

        stage('Deploy Backend') {
            steps {
                echo "🚀 Deploying backend..."
                sh """
                    sudo systemctl stop hypertek-backend || true
                    sudo rm -rf /var/www/hyper-tek-game/backend-deploy
                    sudo mkdir -p /var/www/hyper-tek-game/backend-deploy
                    sudo cp -r $BACKEND_DIR/* /var/www/hyper-tek-game/backend-deploy/
                    sudo chown -R www-data:www-data /var/www/hyper-tek-game/backend-deploy
                    sudo systemctl start hypertek-backend || true
                """
            }
        }

        stage('Restart Nginx') {
            steps {
                echo '🔁 Restarting Nginx...'
                sh "sudo nginx -t && sudo systemctl reload nginx"
            }
        }
    }

    post {
        success {
            echo "✅ HyperTek Game project deployed successfully without affecting other apps!"
        }
        failure {
            echo "❌ Deployment failed. Please check Jenkins console logs for details."
        }
    }
}
