pipeline {
    agent {
        docker {
            image 'maven:3.8-eclipse-temurin-17-node-18'
            args '-v /var/run/docker.sock:/var/run/docker.sock --group-add 999'
        }
    }

    environment {
        DOCKER_REGISTRY = 'index.docker.io'
        DOCKER_IMAGE_BACKEND = 'dima263/e-shop-backend'
        DOCKER_IMAGE_FRONTEND = 'dima263/e-shop-frontend'

        DOCKER_CREDENTIALS_ID = 'docker-hub-token'

        GIT_REPO_URL = 'git@github.com:SolarDm/e-shop.git'
        GIT_BRANCH = 'main'
        GIT_CREDENTIALS_ID = 'jenkins-wsl-ssh-key'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${GIT_REPO_URL}",
                        credentialsId: "${GIT_CREDENTIALS_ID}"
                    ]]
                ])
            }
        }

        stage('Build Projects') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}", './backend')
                    docker.build("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}", './frontend')
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
                        docker.image("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}").push()
                        docker.image("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}").push()
                        docker.image("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}").push('latest')
                        docker.image("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}").push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker-compose down || true
                    docker-compose pull
                    docker-compose up -d
                    docker-compose logs --tail=20
                '''
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f --filter "until=24h"'
        }
        success {
            echo 'Пайплайн успешно выполнен! Приложение развернуто.'
        }
        failure {
            echo 'Пайплайн завершился с ошибкой. Проверьте логи.'
        }
    }
}