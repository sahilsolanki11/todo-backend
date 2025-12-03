pipeline {
    agent any

    environment {
        MONGO_URI = credentials('mongo-uri-id')
        JWT_SECRET = credentials('jwt-secret-id')
        DOCKER_NETWORK = "todo-net"
    }

    stages {

        stage('Clean Workspace') {
            steps { cleanWs() }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'dev', url: 'https://github.com/sahilsolanki11/todo-backend.git'
            }
        }

        stage('Build Backend UAT Image') {
            steps {
                sh '''
                docker network inspect $DOCKER_NETWORK || docker network create $DOCKER_NETWORK
                docker build --no-cache -t todo-backend:uat .
                '''
            }
        }

        stage('Deploy Backend UAT') {
            steps {
                sh '''
                docker stop todo-backend-uat || true
                docker rm todo-backend-uat || true

                docker run -d \
                  --name todo-backend-uat \
                  --network $DOCKER_NETWORK \
                  -e MONGO_URI="$MONGO_URI" \
                  -e JWT_SECRET="$JWT_SECRET" \
                  -e PORT="5000" \
                  -p 5001:5000 \
                  todo-backend:uat
                '''
            }
        }

        stage('Approval for Production') {
            steps {
                input message: 'Proceed to Production Deployment?'
            }
        }

        stage('Build Backend Production Image') {
            steps {
                sh '''
                docker tag todo-backend:prod todo-backend:prev || true
                docker build --no-cache -t todo-backend:prod .
                '''
            }
        }

        stage('Deploy Backend Production') {
            steps {
                sh '''
                docker stop todo-backend-prod || true
                docker rm todo-backend-prod || true

                docker run -d \
                  --name todo-backend-prod \
                  --network $DOCKER_NETWORK \
                  -e MONGO_URI="$MONGO_URI" \
                  -e JWT_SECRET="$JWT_SECRET" \
                  -e PORT="5000" \
                  -p 5000:5000 \
                  todo-backend:prod
                '''
            }
        }
    }

    post {
        failure {
            echo "❌ Failed! Rolling back backend..."
            sh '''
            docker stop todo-backend-prod || true
            docker rm todo-backend-prod || true
            docker run -d --name todo-backend-prod --network $DOCKER_NETWORK -p 5000:5000 todo-backend:prev || true
            '''
        }
    }
}
