pipeline {
    agent any

    environment {
        // Use Jenkins Credentials IDs here
        MONGO_URI = credentials('mongo_uri')   
        JWT_SECRET = credentials('jwt_secret')
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
                    echo "⚙️ Building UAT backend image"
                    sh '''
                    echo "PORT=5000" > .env
                    echo "MONGO_URI=${MONGO_URI}" >> .env
                    echo "JWT_SECRET=${JWT_SECRET}" >> .env

                    docker build -t todo-backend:uat .
                    '''
                }
            }
        }

        stage('Deploy to UAT') {
            steps {
                script {
                    echo "🚀 Deploying backend UAT on port 5001"
                    sh '''
                    docker stop todo-backend-uat || true
                    docker rm todo-backend-uat || true
                    docker run -d -p 5001:5000 --name todo-backend-uat todo-backend:uat
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
                    echo "⚙️ Building Production backend image"
                    sh '''
                    echo "PORT=5000" > .env
                    echo "MONGO_URI=${MONGO_URI}" >> .env
                    echo "JWT_SECRET=${JWT_SECRET}" >> .env

                    docker build -t todo-backend:prod .
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    echo "🚀 Deploying backend Production on port 5000"
                    sh '''
                    docker stop todo-backend-prod || true
                    docker rm todo-backend-prod || true
                    docker run -d -p 5000:5000 --name todo-backend-prod todo-backend:prod
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
                docker stop todo-backend-prod || true
                docker rm todo-backend-prod || true
                docker run -d -p 5000:5000 --name todo-backend-prod todo-backend:previous || true
                '''
            }
        }
    }
}
