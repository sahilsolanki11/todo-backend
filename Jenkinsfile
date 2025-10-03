pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/sahilsolanki11/todo-backend.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build UAT Docker Image') {
            steps {
                script {
                    echo "⚙️ Building UAT backend image"
                    // UAT env file
                    bat 'echo PORT=5000 > .env'
                    bat 'echo MONGO_URI=mongodb://host.docker.internal:27017/tododb >> .env'
                    bat 'docker build -t todo-backend:uat .'
                }
            }
        }

        stage('Deploy to UAT') {
            steps {
                script {
                    echo "🚀 Deploying backend UAT on port 5001"
                    bat '''
                    docker stop todo-backend-uat || exit 0
                    docker rm todo-backend-uat || exit 0
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
                    // Production env file
                    bat 'echo PORT=5000 > .env'
                    bat 'echo MONGO_URI=mongodb://host.docker.internal:27017/tododb >> .env'
                    bat 'docker build -t todo-backend:prod .'
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    echo "🚀 Deploying backend Production on port 5000"
                    bat '''
                    docker commit todo-backend-prod todo-backend:previous || exit 0
                    docker stop todo-backend-prod || exit 0
                    docker rm todo-backend-prod || exit 0
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
                bat '''
                docker stop todo-backend-prod || exit 0
                docker rm todo-backend-prod || exit 0
                docker run -d -p 5000:5000 --name todo-backend-prod todo-backend:previous || exit 0
                '''
            }
        }
    }
}
