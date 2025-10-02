pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/sahilsolanki11/todo-backend.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    bat 'docker build -t todo-backend:latest .'
                }
            }
        }

        stage('Deploy to UAT') {
            steps {
                script {
                    bat '''
                    docker stop todo-backend-uat || exit 0
                    docker rm todo-backend-uat || exit 0
                    docker run -d -p 5001:5000 --name todo-backend-uat todo-backend:latest
                    '''
                }
            }
        }

        stage('Approval for Production') {
            steps {
                input "✅ UAT testing done? Deploy backend to Production?"
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    // Save old production container as backup before new deploy
                    bat "docker commit todo-backend-prod todo-backend:previous || exit 0"
                    bat '''
                    docker stop todo-backend-prod || exit 0
                    docker rm todo-backend-prod || exit 0
                    docker run -d -p 5000:5000 --name todo-backend-prod todo-backend:latest
                    '''
                }
            }
        }
    }

    post {
        failure {
            echo '❌ Backend deployment failed! Rolling back...'
            script {
                bat '''
                docker stop todo-backend-prod || exit 0
                docker rm todo-backend-prod || exit 0
                docker run -d -p 5000:5000 --name todo-backend-prod todo-backend:previous || exit 0
                '''
            }
        }
        success {
            echo '✅ Backend pipeline finished successfully!'
        }
    }
}
