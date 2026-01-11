package tests;

import org.junit.jupiter.api.Test;
import pages.LoginPage;
import pages.components.HeaderPage;

class LoginTests extends BaseTest {
    
    @Test
    void loginWithValidCredentials() {
        new LoginPage()
            .open()
            .enterUsername(TEST_USER_USERNAME)
            .enterPassword(TEST_PASSWORD)
            .clickLogin()
            .shouldHaveSuccess();
        
        new HeaderPage()
            .shouldShowUserMenu(TEST_USER_USERNAME);
    }
    
    @Test
    void loginWithInvalidCredentials() {
        new LoginPage()
            .open()
            .enterUsername("wrong")
            .enterPassword("wrong")
            .clickLogin()
            .shouldHaveError("Неверные учетные данные");
    }
    
    @Test
    void demoLoginButtonWorks() {
        new LoginPage()
            .open()
            .clickDemo()
            .enterUsername("demo")
            .enterPassword("Demo123!")
            .clickLogin()
            .shouldHaveSuccess();
    }
}
