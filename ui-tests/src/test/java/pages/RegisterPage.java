package pages;

import com.codeborne.selenide.SelenideElement;
import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class RegisterPage {
    
    private final SelenideElement usernameInput = $("#username");
    private final SelenideElement emailInput = $("#email");
    private final SelenideElement passwordInput = $("#password");
    private final SelenideElement confirmPasswordInput = $("#confirmPassword");
    private final SelenideElement registerButton = $(".register-btn");
    private final SelenideElement termsCheckbox = $("#agreeTerms");
    
    public RegisterPage open() {
        open("/register");
        return this;
    }
    
    public RegisterPage fillForm(String username, String email, String password) {
        usernameInput.setValue(username);
        emailInput.setValue(email);
        passwordInput.setValue(password);
        confirmPasswordInput.setValue(password);
        return this;
    }
    
    public RegisterPage acceptTerms() {
        termsCheckbox.click();
        return this;
    }
    
    public RegisterPage submit() {
        registerButton.click();
        return this;
    }
    
    public RegisterPage shouldShowPasswordStrength(String strength) {
        $(".strength-text").shouldHave(text(strength));
        return this;
    }
    
    public RegisterPage shouldHaveValidationError() {
        $(".error-text").shouldBe(visible);
        return this;
    }
}
