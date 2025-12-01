pipeline {
    agent any

    environment {
        MONGO_URI = credentials('mongo-uri-id')
        JWT_SECRET = credentials('jwt-secret-id')
        PORT = "5000"
        DOCKER_NETWORK = "todo-net"
    }

    stages {

        // =======================
        // Checkout Stage
        // =======================
        stage('Checkout Backend') {
            steps {
                git branch: 'dev', url: 'https://github.com/sahilsolanki11/todo-backend.git'
            }
        }

        // =======================
        // Install Dependencies
        // =======================
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        // =======================
        // Build UAT Docker Image
        // =======================
        stage('Build UAT Docker Image') {
            steps {
                sh 'docker build -t todo-backend:uat .'
            }
        }

        // =======================
        // Deploy to UAT
        // =======================
        stage('Deploy UAT') {
            steps {
                sh """
                docker network inspect $DOCKER_NETWORK || docker network create $DOCKER_NETWORK
                docker stop todo-backend-uat || true
                docker rm todo-backend-uat || true
                docker run -d \
                    --name todo-backend-uat \
                    --network $DOCKER_NETWORK \
                    -e MONGO_URI="$MONGO_URI" \
                    -e JWT_SECRET="$JWT_SECRET" \
                    -e PORT="$PORT" \
                    -p 5001:5000 \
                    todo-backend:uat
                """
            }
        }

        // =======================
        // Approval for Production
        // =======================
        stage('Approval for Production') {
            steps {
                input "✔ UAT looks good? Deploy Backend to Production?"
            }
        }

        // =======================
        // Build Production Docker Image
        // =======================
        stage('Build Production Docker Image') {
            steps {
                sh """
                docker tag todo-backend:prod todo-backend:previous || true
                docker build -t todo-backend:prod .
                """
            }
        }

        // =======================
        // Deploy to Production
        // =======================
        stage('Deploy Production') {
            steps {
                sh """
                docker stop todo-backend-prod || true
                docker rm todo-backend-prod || true
                docker run -d \
                    --name todo-backend-prod \
                    --network $DOCKER_NETWORK \
                    -e MONGO_URI="$MONGO_URI" \
                    -e JWT_SECRET="$JWT_SECRET" \
                    -e PORT="$PORT" \
                    -p 5000:5000 \
                    todo-backend:prod
                """
            }
        }
    }

    post {
        success {
            echo "✔ Backend CI/CD completed successfully!"
        }
        failure {
            echo "❌ Backend deployment failed! Rolling back Production..."
            sh """
            docker stop todo-backend-prod || true
            docker rm todo-backend-prod || true
            docker run -d \
                --name todo-backend-prod \
                --network $DOCKER_NETWORK \
                todo-backend:previous || true
            """
        }
    }
}
