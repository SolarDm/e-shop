package tests;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.Condition;
import io.github.bonigarcia.wdm.WebDriverManager;
import io.restassured.RestAssured;
import org.openqa.selenium.chrome.ChromeOptions;
import org.junit.jupiter.api.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import static com.codeborne.selenide.Selenide.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.is;


public class BaseTest {
    protected static String TEST_USER_USERNAME = "testuser" + System.currentTimeMillis();
    protected static final String TEST_PASSWORD = "password123";

    @BeforeAll
    static void setUpAll() {
        WebDriverManager wdm = WebDriverManager.chromedriver();
        wdm.setup();
        
        String baseUrl = System.getProperty("baseUrl", "http://172.18.117.61:81");
        Configuration.baseUrl = baseUrl;
        Configuration.browserSize = "1920x1080";
        Configuration.headless = Boolean.parseBoolean(System.getProperty("headless", "true"));
        Configuration.timeout = 15000;
        Configuration.browser = "chrome";
        
        ChromeOptions options = new ChromeOptions();
        options.addArguments(
            "--headless=new",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--window-size=1920,1080",
            "--remote-allow-origins=*"
        );
        
        options.setExperimentalOption("excludeSwitches", 
            new String[]{"enable-logging", "enable-automation"});
        
        Configuration.browserCapabilities = options;
        
        RestAssured.baseURI = baseUrl;

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
                    .post("/api/auth/signup")
                    .then()
                    .statusCode(anyOf(is(200), is(400)));

        } catch (Exception e) {
            System.err.println("Не удалось создать тестовых пользователей: " + e.getMessage());
        }
    }

    @BeforeEach
    void setUp() {
        open("/");
        clearBrowserCookies();
        clearBrowserLocalStorage();
    }

    @AfterEach
    void tearDown() {
        clearBrowserCookies();
        clearBrowserLocalStorage();
        open("/");
        $("body").shouldBe(Condition.visible);
    }

    @AfterAll
    static void tearDownAll() {
        closeWebDriver();
    }

    protected void loginAsUser() {
        open("/login");
        $("#username").shouldBe(Condition.visible, Duration.ofSeconds(10)).setValue(TEST_USER_USERNAME);
        $("#password").shouldBe(Condition.visible).setValue(TEST_PASSWORD);
        $(".login-btn").shouldBe(Condition.enabled).click();

        $(".user-menu, .logout-btn").shouldBe(Condition.visible, Duration.ofSeconds(10));
    }

    protected void loginAsAdmin() {
        open("/login");
        $("#username").shouldBe(Condition.visible, Duration.ofSeconds(10)).setValue("admin");
        $("#password").shouldBe(Condition.visible).setValue("admin123");
        $(".login-btn").shouldBe(Condition.enabled).click();

        $(".user-menu, .logout-btn").shouldBe(Condition.visible, Duration.ofSeconds(10));
    }
}