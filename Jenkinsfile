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
                    bat 'docker build -t todo-backend .'
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    bat '''
                    docker stop todo-backend || exit 0
                    docker rm todo-backend || exit 0
                    docker run -d -p 5000:5000 --name todo-backend todo-backend
                    '''
                }
            }
        }
    }
}
