pipeline {
    agent any
    environment {
        // Deployment directories
        DEPLOY_DIR = "/var/www/hyper-tek-game"
        
        FRONTEND_DIR = "${DEPLOY_DIR}/frontend"
        ADMIN_DIR = "${DEPLOY_DIR}/admin"
        BACKEND_DIR = "${DEPLOY_DIR}/backend"

        FRONTEND_WEB_ROOT = "/usr/share/nginx/html/hyper-tekgame"
        ADMIN_WEB_ROOT = "/usr/share/nginx/html/hyper-tekgame-admin"

        BACKEND_PORT = "4700"
        
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
                echo ":file_folder: Preparing deployment directory..."
                sh """
                    sudo rm -rf $DEPLOY_DIR
                    sudo mkdir -p $DEPLOY_DIR
                    sudo cp -r . $DEPLOY_DIR
                    sudo chown -R \$(whoami):\$(whoami) $DEPLOY_DIR
                """
            }
        }

        stage('Build User Frontend') {
            steps {
                echo ':gear: Building USER frontend...'
                sh """
                    cd $FRONTEND_DIR
                    npm ci --legacy-peer-deps || npm install --legacy-peer-deps
                    npm run build
                """
            }
        }

        stage('Build Admin Frontend') {
            steps {
                echo ':gear: Building ADMIN frontend...'
                sh """
                    cd $ADMIN_DIR
                    npm ci --legacy-peer-deps || npm install --legacy-peer-deps
                    npm run build
                """
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo ':hammer_and_wrench: Installing backend dependencies...'
                sh """
                    cd $BACKEND_DIR
                    npm ci --legacy-peer-deps || npm install --legacy-peer-deps
                """
            }
        }

        stage('Backup Current Deployment') {
            steps {
                echo ":package: Backing up current deployment..."

                sh """
                    # Create backup folders properly
                    sudo mkdir -p $BACKUP_DIR/user
                    sudo mkdir -p $BACKUP_DIR/admin

                    sudo rm -rf $BACKUP_DIR/user/*
                    sudo rm -rf $BACKUP_DIR/admin/*

                    # Backup USER frontend
                    if [ -d "$FRONTEND_WEB_ROOT" ] && [ "\$(ls -A $FRONTEND_WEB_ROOT)" ]; then
                        echo "Backing up USER frontend..."
                        sudo cp -r $FRONTEND_WEB_ROOT/* $BACKUP_DIR/user/
                    fi

                    # Backup ADMIN frontend
                    if [ -d "$ADMIN_WEB_ROOT" ] && [ "\$(ls -A $ADMIN_WEB_ROOT)" ]; then
                        echo "Backing up ADMIN frontend..."
                        sudo cp -r $ADMIN_WEB_ROOT/* $BACKUP_DIR/admin/
                    fi
                """
            }
        }

        stage('Deploy User Frontend') {
            steps {
                echo ":rocket: Deploying USER frontend..."
                sh """
                    sudo mkdir -p $FRONTEND_WEB_ROOT
                    sudo rm -rf $FRONTEND_WEB_ROOT/*
                    sudo cp -r $FRONTEND_DIR/dist/* $FRONTEND_WEB_ROOT/
                """
            }
        }

        stage('Deploy Admin Frontend') {
            steps {
                echo ":rocket: Deploying ADMIN frontend..."
                sh """
                    sudo mkdir -p $ADMIN_WEB_ROOT
                    sudo rm -rf $ADMIN_WEB_ROOT/*
                    sudo cp -r $ADMIN_DIR/dist/* $ADMIN_WEB_ROOT/
                """
            }
        }

stage('Restart Backend') {
    steps {
        echo ":arrows_counterclockwise: Restarting backend..."
        sh """
            export PORT=$BACKEND_PORT

            if pm2 list | grep -q 'hyper-tek-backend'; then
                pm2 restart hyper-tek-backend --update-env
            else
                pm2 start $BACKEND_DIR/Index.js --name hyper-tek-backend --watch
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
            echo ":white_check_mark: Hyper-Tek Game (User + Admin) deployed successfully!"
        }
        failure {
            echo ":x: Deployment failed. Check Jenkins logs for details."
        }
    }
}
 


