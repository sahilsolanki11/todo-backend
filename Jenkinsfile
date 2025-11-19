pipeline {
    agent any

    environment {
        MONGO_URI  = credentials('mongo_uri')    // Jenkins credential ID for Mongo URL
        JWT_SECRET = credentials('jwt_secret')   // Jenkins credential ID for JWT secret
        PORT       = "5000"                       // Define port as a constant
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

        stage('Prepare .env') {
            steps {
                script {
                    // Create .env file in Jenkins workspace
                    sh """
                    echo "PORT=${PORT}" > .env
                    echo "MONGO_URI=${MONGO_URI}" >> .env
                    echo "JWT_SECRET=${JWT_SECRET}" >> .env
                    """
                }
            }
        }

        stage('Build UAT Docker Image') {
            steps {
                script {
                    echo "⚙️ Building UAT backend image"
                    sh 'docker build -t todo-backend:uat .'
                }
            }
        }

        stage('Deploy to UAT') {
            steps {
                script {
                    echo "🚀 Deploying backend UAT"
                    sh """
                    docker stop todo-backend-uat || true
                    docker rm todo-backend-uat || true
                    docker run -d \
                      --name todo-backend-uat \
                      --network todo-net \
                      -p 5001:5000 \
                      todo-backend:uat
                    """
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
                    echo "⚙️ Building Production backend image"
                    sh 'docker build -t todo-backend:prod .'
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    echo "🚀 Deploying backend Production"
                    sh """
                    docker stop todo-backend-prod || true
                    docker rm todo-backend-prod || true
                    docker run -d \
                      --name todo-backend-prod \
                      --network todo-net \
                      -p 5000:5000 \
                      todo-backend:prod
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Backend pipeline finished successfully!"
        }
        failure {
            echo "❌ Backend deployment failed."
        }
    }
}
