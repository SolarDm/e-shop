package tests;

import org.junit.jupiter.api.Test;
import pages.LoginPage;
import pages.HeaderPage;

class LoginTests extends BaseTest {
    
    @Test
    void loginWithValidCredentials() {
        new LoginPage()
            .open()
            .enterUsername("testuser")
            .enterPassword("password123")
            .clickLogin()
            .shouldHaveSuccess();
        
        new HeaderPage()
            .shouldShowUserMenu("testuser");
    }
    
    @Test
    void loginWithInvalidCredentials() {
        new LoginPage()
            .open()
            .enterUsername("wrong")
            .enterPassword("wrong")
            .clickLogin()
            .shouldHaveError("Неверное имя пользователя или пароль");
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
