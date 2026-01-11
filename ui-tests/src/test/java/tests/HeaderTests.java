package tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Alert;
import pages.ProductListPage;
import pages.components.HeaderPage;

import static com.codeborne.selenide.Selenide.*;

class HeaderTests extends BaseTest {
    
    private HeaderPage header;
    private ProductListPage productListPage;
    
    @BeforeEach
    void setUp() {
        header = new HeaderPage();
        productListPage = new ProductListPage().open();
    }
    
    @Test
    void headerIsVisibleOnMainPage() {
        header
            .shouldBeVisible()
            .shouldHaveLogo()
            .shouldHaveActiveLink("Товары");
    }
    
    @Test
    void guestMenuShowsCorrectly() {
        header
            .shouldShowGuestMenu()
            .shouldShowLoginLink()
            .shouldShowRegisterLink()
            .shouldNotShowAdminMenu();
        
        assert !header.isUserLoggedIn() : "Пользователь не должен быть авторизован";
    }
    
    @Test
    void navigateToLoginPage() {
        header
            .clickLogin()
            .shouldHaveActiveLink("Вход");
        
        assert webdriver().driver().url().contains("/login");
    }
    
    @Test
    void navigateToRegisterPage() {
        header
            .clickRegister()
            .shouldHaveActiveLink("Регистрация");
        
        assert webdriver().driver().url().contains("/register");
    }

    @Test
    void authenticatedUserMenu() {
        loginAsUser();
        
        header
            .shouldShowUserMenu("testuser")
            .shouldHaveCartLink()
            .shouldNotShowAdminMenu();
    }
    
    @Test
    void navigateToCart() {
        loginAsUser();
        
        header
            .clickCart()
            .shouldHaveActiveLink("Корзина");
        
        assert webdriver().driver().url().contains("/cart");
    }
    
    @Test
    void navigateToOrders() {
        loginAsUser();
        
        header
            .clickOrders()
            .shouldHaveActiveLink("Заказы");
        
        assert webdriver().driver().url().contains("/orders");
    }
    
    @Test
    void adminMenuShowsForAdmin() {
        loginAsAdmin();
        
        header
            .shouldShowUserMenu("admin")
            .shouldShowAdminMenu()
            .shouldHaveCartLink();
    }
    
    @Test
    void navigateToAdminPanel() {
        loginAsAdmin();
        
        header
            .clickAdmin()
            .shouldHaveActiveLink("Админка");
        
        assert webdriver().driver().url().contains("/admin");
    }
    
    @Test
    void cartCounterUpdatesAfterAddingProduct() {
        loginAsUser();
        
        productListPage.addProductToCart(0);

        refresh();

        header.shouldHaveCartCount(1);
    
        productListPage.addProductToCart(1);

        refresh();

        header.shouldHaveCartCount(2);
    }
    
    @Test
    void logoutFunctionality() {
        loginAsUser();
        
        assert header.isUserLoggedIn();

        executeJavaScript("window.confirm = function() { return true; }");

        header.clickLogout();

        header.shouldShowGuestMenu();
    }
    
    @Test
    void cancelLogout() {
        loginAsUser();

        executeJavaScript("window.confirm = function() { return false; }");

        header.clickLogout();

        assert header.isUserLoggedIn();
        header.shouldShowUserMenu("testuser");
    }
    
    @Test
    void activeLinksOnNavigation() {
        header
            .shouldHaveActiveLink("Товары");
        
        header.clickLogin();
        header.shouldHaveActiveLink("Вход");
        
        header.clickProducts();
        header.shouldHaveActiveLink("Товары");
    }
    
    @Test
    void fullUserFlow() {
        header.shouldShowGuestMenu();
        
        header.clickLogin();

        $("#username").setValue(TEST_USER_USERNAME);
        $("#password").setValue(TEST_PASSWORD);
        $(".login-btn").click();
        
        header.shouldShowUserMenu(TEST_USER_USERNAME);

        productListPage.addProductToCart(0);

        Alert alert = webdriver().driver().switchTo().alert();
        alert.accept();

        refresh();

        header.shouldHaveCartCount(1);

        header.clickLogout();
        
        header.shouldShowGuestMenu();
    }
}
