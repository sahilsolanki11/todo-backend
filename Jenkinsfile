pipeline {
    agent any

    environment {
        MONGO_URI = credentials('mongo-uri-id')
        JWT_SECRET = credentials('jwt-secret-id')
        PORT = "5000"
    }

    stages {

        stage('Checkout') {
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
                sh 'docker build -t todo-backend:uat .'
            }
        }

        stage('Deploy to UAT') {
            steps {
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

        stage('Approval for Production') {
            steps {
                input "Proceed to PRODUCTION?"
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

        stage('Deploy to Production') {
            steps {
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

    post {
        failure {
            echo "❌ Deployment failed. Rolling back..."
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
