package tests;

import org.junit.jupiter.api.Test;
import pages.RegisterPage;

class RegisterTests extends BaseTest {

    @Test
    void registerWithWeakPassword() {
        new RegisterPage()
            .open()
            .fillForm("test", "test@example.com", "123")
            .acceptTerms()
            .submit()
            .shouldHaveValidationError();
    }
    
    @Test
    void registerWithoutAcceptingTerms() {
        new RegisterPage()
            .open()
            .fillForm("testuser", "test@example.com", "StrongPass123!")
            .submit()
            .shouldHaveValidationError();
    }
}
