package tests;

import com.codeborne.selenide.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import static com.codeborne.selenide.Selenide.*;

public class BaseTest {
    protected static String TEST_USER_USERNAME = "testuser";
    protected static final String TEST_PASSWORD = "password123";
    
    @BeforeAll
    static void setUpAll() {
        Configuration.baseUrl = System.getProperty("baseUrl", "http://172.18.117.61");
        Configuration.browserSize = "1920x1080";
        Configuration.headless = Boolean.parseBoolean(System.getProperty("headless", "true"));
        Configuration.timeout = 10000;
        

        createTestUsers();
    }
    
    private static void createTestUsers() {
        try {
            Map<String, Object> userData = new HashMap<>();
            userData.put("username", TEST_USER_USERNAME);
            userData.put("email", TEST_USER_USERNAME + "@test.com");
            userData.put("password", TEST_PASSWORD);
            
            given()
                .contentType("application/json")
                .body(userData)
            .when()
                .post("/api/auth/register")
            .then()
                .statusCode(200);
        } catch (Exception e) {
            System.err.println("Не удалось создать тестовых пользователей: " + e.getMessage());
        }
    }
    
    @BeforeEach
    void setUp() {
        clearBrowserCookies();
        clearBrowserLocalStorage();
    }
    
    protected void loginAsUser() {
        open("/login");
        $("#username").setValue("testuser");
        $("#password").setValue("password123");
        $(".login-btn").click();
    }
    
    protected void loginAsAdmin() {
        open("/login");
        $("#username").setValue("admin");
        $("#password").setValue("admin123");
        $(".login-btn").click();
    }
}
