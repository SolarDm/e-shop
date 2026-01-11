package pages.components;

import com.codeborne.selenide.SelenideElement;
import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class HeaderPage {
    private final SelenideElement header = $("header.header");
    private final SelenideElement logo = header.$(".logo");
    private final SelenideElement navMenu = header.$(".nav-menu");

    private final SelenideElement productsLink = navMenu.$(".nav-link");
    private final SelenideElement cartLink = navMenu.$(".nav-link.cart-link");
    private final SelenideElement ordersLink = navMenu.$(".nav-link.order-link");
    private final SelenideElement adminLink = navMenu.$(".nav-link.admin-link");
    private final SelenideElement loginLink = navMenu.$(".nav-link.login-link");
    private final SelenideElement registerLink = navMenu.$(".register-link");

    private final SelenideElement userSection = navMenu.$(".user-section");
    private final SelenideElement username = userSection.$(".username");
    private final SelenideElement logoutButton = userSection.$(".logout-btn");
    private final SelenideElement cartBadge = cartLink.$(".cart-badge");
    
    public HeaderPage shouldBeVisible() {
        header.shouldBe(visible);
        return this;
    }
    
    public HeaderPage shouldHaveLogo() {
        logo.shouldBe(visible)
            .shouldHave(text("E-Shop"));
        return this;
    }
    
    public HeaderPage shouldShowGuestMenu() {
        productsLink.shouldBe(visible);
        loginLink.shouldBe(visible);
        registerLink.shouldBe(visible);
        cartLink.shouldNotBe(visible);
        userSection.shouldNotBe(visible);
        return this;
    }
    
    public HeaderPage shouldShowLoginLink() {
        loginLink.shouldBe(visible)
            .shouldHave(text("Вход"));
        return this;
    }
    
    public HeaderPage shouldShowRegisterLink() {
        registerLink.shouldBe(visible)
            .shouldHave(text("Регистрация"));
        return this;
    }
    
    public HeaderPage shouldShowUserMenu(String expectedUsername) {
        productsLink.shouldBe(visible);
        cartLink.shouldBe(visible);
        ordersLink.shouldBe(visible);
        userSection.shouldBe(visible);
        registerLink.shouldNotBe(visible);
        
        if (expectedUsername != null) {
            username.shouldHave(text(expectedUsername));
        }
        return this;
    }
    
    public HeaderPage shouldShowAdminMenu() {
        adminLink.shouldBe(visible)
            .shouldHave(text("Админка"));
        return this;
    }
    
    public HeaderPage shouldNotShowAdminMenu() {
        adminLink.shouldNotBe(visible);
        return this;
    }
    
    public HeaderPage shouldHaveCartCount(int expectedCount) {
        cartLink.shouldBe(visible);
        
        if (expectedCount > 0) {
            cartBadge.shouldBe(visible);
        } else {
            cartBadge.shouldNotBe(visible);
        }
        return this;
    }
    
    public HeaderPage shouldHaveCartLink() {
        cartLink.shouldBe(visible)
            .shouldHave(text("Корзина"));
        return this;
    }
    
    public HeaderPage clickLogo() {
        logo.click();
        return this;
    }
    
    public HeaderPage clickProducts() {
        productsLink.click();
        return this;
    }
    
    public HeaderPage clickLogin() {
        loginLink.click();
        return this;
    }
    
    public HeaderPage clickRegister() {
        registerLink.click();
        return this;
    }
    
    public HeaderPage clickCart() {
        cartLink.click();
        return this;
    }
    
    public HeaderPage clickOrders() {
        ordersLink.click();
        return this;
    }
    
    public HeaderPage clickAdmin() {
        adminLink.click();
        return this;
    }
    
    public HeaderPage clickLogout() {
        logoutButton.click();
        return this;
    }
    
    public boolean isUserLoggedIn() {
        return userSection.exists() && userSection.isDisplayed();
    }
    
    public HeaderPage shouldHaveActiveLink(String linkText) {
        navMenu.$(".nav-link.active .nav-text")
            .shouldHave(text(linkText));
        return this;
    }
}