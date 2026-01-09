pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = ''
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

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            script {
                                docker.build("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}", '.')
                            }
                        }
                    }
                }

                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            script {
                                docker.build("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}", '.')
                            }
                        }
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    withCredentials([string(credentialsId: DOCKER_CREDENTIALS_ID, variable: 'DOCKER_PASSWORD')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u dima263 --password-stdin'
                        
                        sh """
                            docker push ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}
                            docker push ${DOCKER_IMAGE_BACKEND}:latest
                            docker push ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}
                            docker push ${DOCKER_IMAGE_FRONTEND}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy') {
            agent any
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