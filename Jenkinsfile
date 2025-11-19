pipeline {
    agent any

    environment {
        MONGO_URI = credentials('mongo-uri-id')
        JWT_SECRET = credentials('jwt-secret-id')
        PORT = credentials('port-id')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/sahilsolanki11/todo-backend.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build UAT Docker Image') {
            steps {
                script {
                    sh '''
                    docker build -t todo-backend:uat .
                    '''
                }
            }
        }

        stage('Deploy to UAT') {
            steps {
                script {
                    sh '''
                    docker stop todo-backend-uat || true
                    docker rm todo-backend-uat || true
                    docker run -d \
                      --name todo-backend-uat \
                      --network todo-net \
                      -e MONGO_URI="$MONGO_URI" \
                      -e JWT_SECRET="$JWT_SECRET" \
                      -e PORT="$PORT" \
                      -p 5001:5000 \
                      todo-backend:uat
                    '''
                }
            }
        }

        stage('Approval for Production') {
            steps {
                input "✅ UAT testing done? Deploy backend to Production?"
            }
        }

        stage('Build Production Docker Image') {
            steps {
                script {
                    sh '''
                    docker tag todo-backend:prod todo-backend:previous || true
                    docker build -t todo-backend:prod .
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    sh '''
                    docker stop todo-backend-prod || true
                    docker rm todo-backend-prod || true
                    docker run -d \
                      --name todo-backend-prod \
                      --network todo-net \
                      -e MONGO_URI="$MONGO_URI" \
                      -e JWT_SECRET="$JWT_SECRET" \
                      -e PORT="$PORT" \
                      -p 5000:5000 \
                      todo-backend:prod
                    '''
                }
            }
        }
    }

    post {
        failure {
            echo "❌ Backend deployment failed. Rolling back..."
            script {
                sh '''
                docker stop todo-backend-prod || true
                docker rm todo-backend-prod || true
                docker run -d \
                  --name todo-backend-prod \
                  --network todo-net \
                  todo-backend:previous || true
                '''
            }
        }
    }
}
