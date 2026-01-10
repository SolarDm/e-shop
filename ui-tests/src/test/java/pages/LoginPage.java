package pages;

import com.codeborne.selenide.SelenideElement;
import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class LoginPage {
    
    private final SelenideElement usernameInput = $("#username");
    private final SelenideElement passwordInput = $("#password");
    private final SelenideElement loginButton = $(".login-btn");
    private final SelenideElement demoButton = $(".demo-btn");
    private final SelenideElement rememberCheckbox = $("#remember");
    private final SelenideElement showPasswordButton = $(".password-toggle");
    
    public LoginPage open() {
        open("/login");
        return this;
    }
    
    public LoginPage enterUsername(String username) {
        usernameInput.setValue(username);
        return this;
    }
    
    public LoginPage enterPassword(String password) {
        passwordInput.setValue(password);
        return this;
    }
    
    public LoginPage clickLogin() {
        loginButton.click();
        return this;
    }
    
    public LoginPage clickDemo() {
        demoButton.click();
        return this;
    }
    
    public LoginPage togglePasswordVisibility() {
        showPasswordButton.click();
        return this;
    }
    
    public LoginPage shouldHaveError(String errorText) {
        $(".error-message").shouldHave(text(errorText));
        return this;
    }
    
    public LoginPage shouldHaveSuccess() {
        $(".success-message").shouldBe(visible);
        return this;
    }
    
    public boolean isPasswordVisible() {
        return passwordInput.getAttribute("type").equals("text");
    }
}
