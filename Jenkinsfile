pipeline {
    agent any

    environment {
        MONGO_URI = credentials('mongo-uri-id')   // Jenkins credential ID
        JWT_SECRET = credentials('jwt-secret-id') // Jenkins credential ID
        PORT = "5000"
        DOCKER_NETWORK = "todo-net"
    }

    stages {
        stage('Checkout Backend') {
            steps {
                git branch: 'dev', url: 'https://github.com/sahilsolanki11/todo-backend.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build UAT Docker Image') {
            steps {
                sh '''
                docker network inspect $DOCKER_NETWORK || docker network create $DOCKER_NETWORK
                docker build -t todo-backend:uat .
                '''
            }
        }

        stage('Deploy UAT') {
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
                input "Proceed to deploy Backend to Production?"
            }
        }

        stage('Build Production Docker Image') {
            steps {
                sh '''
                docker tag todo-backend:prod todo-backend:previous || true
                docker build -t todo-backend:prod .
                '''
            }
        }

        stage('Deploy Production') {
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
            echo "❌ Deployment failed. Rolling back Production..."
            sh '''
            docker stop todo-backend-prod || true
            docker rm todo-backend-prod || true
            docker run -d \
              --name todo-backend-prod \
              --network $DOCKER_NETWORK \
              todo-backend:previous || true
            '''
        }
    }
}
