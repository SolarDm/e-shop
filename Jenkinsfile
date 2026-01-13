pipeline {
    agent any

    tools {
        nodejs 'NodeJS 25'
    }

    triggers {
        pollSCM('*/5 * * * *')
    }

    environment {
        DOCKER_IMAGE_BACKEND = 'dima263/e-shop-backend'
        DOCKER_IMAGE_FRONTEND = 'dima263/e-shop-frontend'

        DOCKER_CREDENTIALS_ID = 'docker-hub-token'

        GIT_REPO_URL = 'git@github.com:SolarDm/e-shop.git'
        GIT_BRANCH = 'main'
        GIT_CREDENTIALS_ID = 'jenkins-wsl-ssh-key'

        UI_TESTS_DIR = 'ui-tests'
        TEST_FRONTEND_URL = 'http://172.18.117.61:81'
        TEST_BACKEND_URL = 'http://172.18.117.61:81/api'
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

        stage('Run Test Environment') {
            steps {
                script {                    
                    sh '''
                        docker compose -f docker-compose.test.yml down || true
                        docker compose -f docker-compose.test.yml up -d
                    '''
                }
            }
        }

        stage('Run API Tests') {
            agent any

            steps {
                dir('postman-tests') {
                    script {
                        timeout(time: 3, unit: 'MINUTES') {
                            waitUntil {
                                try {
                                    def result = sh(
                                        script: '''
                                            curl -s -f http://172.18.117.61:81/api/health \
                                                -o /dev/null \
                                                -w "%{http_code}" \
                                                --max-time 5 && echo "READY" || echo "NOT_READY"
                                        ''',
                                        returnStdout: true
                                    ).trim()
                                    
                                    return !result.contains("NOT_READY")
                                } catch (Exception e) {
                                    sleep 10
                                    return false
                                }
                            }
                        }
                        
                        def authToken = sh(
                            script: '''
                                RESPONSE=$(curl -s -X POST http://172.18.117.61:81/api/auth/signin \
                                    -H "Content-Type: application/json" \
                                    -d '{"username":"admin","password":"admin123"}' \
                                    --max-time 10)
                                
                                echo "$RESPONSE" | jq -r '.token'
                            ''',
                            returnStdout: true
                        ).trim()
                        
                        if (!authToken) {
                            error "Не удалось получить токен аутентификации"
                        }
                        
                        sh """
                            cp e-shop-local.json e-shop-local-runtime.json
                            # Экранируем спецсимволы для sed
                            ESCAPED_TOKEN=\$(echo '${authToken}' | sed 's/[\\&]/\\\\&/g')
                            sed -i "s|\\\\\\\${USER_TOKEN}|\${ESCAPED_TOKEN}|g" e-shop-local-runtime.json
                        """
                        
                        sh '''
                            newman run "e-shop-product-api-tests.json" \
                                -e "e-shop-local-runtime.json" \
                                --reporters cli,junit,html \
                                --reporter-junit-export "newman-test-result.xml" \
                                --disable-unicode
                        '''
                    }
                }
            }

            post {
                always {
                    junit 'postman-tests/newman-test-result.xml'
                    archiveArtifacts artifacts: 'postman-tests/newman-test-result.xml, postman-tests/newman-test-report.html', fingerprint: true
                }
            }
        }

        stage('Run UI Tests') {
            agent {
                docker {
                    image 'markhobson/maven-chrome:jdk-17'
                    args '--shm-size=2g'
                    reuseNode true
                }
            }

            steps {
                dir(UI_TESTS_DIR) {
                    script {
                        sh '''
                            mvn clean test \
                            -Dselenide.base-url=${TEST_FRONTEND_URL} \
                            -Dselenide.browser=chrome \
                            -Dselenide.headless=true \
                            -Dselenide.timeout=10000
                        '''
                    }
                }
            }
            post {
                always {
                    junit "${UI_TESTS_DIR}/target/surefire-reports/*.xml"
                    
                    archiveArtifacts artifacts: "${UI_TESTS_DIR}/target/selenide/**/*.png", allowEmptyArchive: true
                }
            }
        }
        

        stage('Stop Test Environment') {
            steps {
                sh '''
                    docker compose -f docker-compose.test.yml down -v || true
                '''
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            script {
                                docker.build("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}", '.')
                                sh "docker tag ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER} ${DOCKER_IMAGE_BACKEND}:latest"
                            }
                        }
                    }
                }

                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            script {
                                docker.build("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}", '.')
                                sh "docker tag ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER} ${DOCKER_IMAGE_FRONTEND}:latest"
                            }
                        }
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: DOCKER_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        sh '''
                            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                            
                            docker push ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}
                            docker push ${DOCKER_IMAGE_BACKEND}:latest
                            docker push ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}
                            docker push ${DOCKER_IMAGE_FRONTEND}:latest
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
            agent any
            steps {
                sh '''
                    docker compose -f docker-compose.yml down || true
                    docker compose -f docker-compose.yml pull
                    docker compose -f docker-compose.yml up -d
                    docker compose -f docker-compose.yml logs --tail=20
                '''
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f --filter "until=24h"'
            sh 'docker compose -f docker-compose.test.yml down -v || true'
        }
        success {
            echo 'Пайплайн успешно выполнен! Приложение развернуто.'
        }
        failure {
            echo 'Пайплайн завершился с ошибкой. Проверьте логи.'
        }
    }
}