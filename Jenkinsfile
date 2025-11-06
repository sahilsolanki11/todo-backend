pipeline {
    agent any

    environment {
        REPO_URL = 'https://github.com/sahilsolanki11/todo-backend.git'
        APP_NAME = 'todo-backend'
        MONGO_URI = 'mongodb+srv://todoUser:todoPass123@cluster0.x2r76.mongodb.net/todoApp?retryWrites=true&w=majority'
        JWT_SECRET = 'mysecret321'
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📦 Checking out code from GitHub..."
                git branch: 'dev', url: "${REPO_URL}"
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "📦 Installing backend dependencies..."
                sh '''
                if [ -f package.json ]; then
                    npm install
                else
                    echo "❌ package.json not found!"
                    exit 1
                fi
                '''
            }
        }

        stage('Build UAT Docker Image') {
            steps {
                script {
                    echo "⚙️ Building UAT Docker image for ${APP_NAME}"
                    sh '''
                    echo "PORT=5000" > .env
                    echo "MONGO_URI=${MONGO_URI}" >> .env
                    echo "JWT_SECRET=${JWT_SECRET}" >> .env

                    docker build -t ${APP_NAME}:uat .
                    '''
                }
            }
        }

        stage('Deploy to UAT') {
            steps {
                script {
                    echo "🚀 Deploying ${APP_NAME} (UAT) on port 5001"
                    sh '''
                    docker stop ${APP_NAME}-uat || true
                    docker rm ${APP_NAME}-uat || true
                    docker run -d -p 5001:5000 --name ${APP_NAME}-uat ${APP_NAME}:uat
                    '''
                }
            }
        }

        stage('Approval for Production') {
            steps {
                input message: "✅ UAT testing done? Deploy backend to Production?"
            }
        }

        stage('Build Production Docker Image') {
            steps {
                script {
                    echo "⚙️ Building Production Docker image for ${APP_NAME}"
                    sh '''
                    echo "PORT=5000" > .env
                    echo "MONGO_URI=${MONGO_URI}" >> .env
                    echo "JWT_SECRET=${JWT_SECRET}" >> .env

                    docker build -t ${APP_NAME}:prod .
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    echo "🚀 Deploying ${APP_NAME} (Production) on port 5000"
                    sh '''
                    docker stop ${APP_NAME}-prod || true
                    docker rm ${APP_NAME}-prod || true
                    docker run -d -p 5000:5000 --name ${APP_NAME}-prod ${APP_NAME}:prod
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Backend pipeline finished successfully!"
        }
        failure {
            echo "❌ Backend deployment failed! Rolling back..."
            script {
                sh '''
                docker stop ${APP_NAME}-prod || true
                docker rm ${APP_NAME}-prod || true
                echo "⚙️ Attempting rollback to previous working image (if any)..."
                docker run -d -p 5000:5000 --name ${APP_NAME}-prod ${APP_NAME}:previous || true
                '''
            }
        }
    }
}
