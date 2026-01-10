package tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pages.ProductListPage;
import pages.components.HeaderPage;

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
    void clickLogoReturnsToHome() {
        header.clickLogin();
        assert webdriver().driver().url().contains("/login");
        
        header.clickLogo();
        
        String currentUrl = webdriver().driver().url();
        assert currentUrl.equals("http://172.18.117.61/") : 
               "Не вернулись на главную";
        
        header.shouldHaveActiveLink("Товары");
    }
    
    @Test
    void authenticatedUserMenu() {
        loginAsUser("testuser", "password123");
        
        header
            .shouldShowUserMenu("testuser")
            .shouldHaveCartLink()
            .shouldNotShowAdminMenu()
            .shouldHaveCartCount(0);
    }
    
    @Test
    void navigateToCart() {
        loginAsUser("testuser", "password123");
        
        header
            .clickCart()
            .shouldHaveActiveLink("Корзина");
        
        assert webdriver().driver().url().contains("/cart");
    }
    
    @Test
    void navigateToOrders() {
        loginAsUser("testuser", "password123");
        
        header
            .clickOrders()
            .shouldHaveActiveLink("Заказы");
        
        assert webdriver().driver().url().contains("/orders");
    }
    
    @Test
    void adminMenuShowsForAdmin() {
        loginAsAdmin("admin", "admin123");
        
        header
            .shouldShowUserMenu("admin")
            .shouldShowAdminMenu()
            .shouldHaveCartLink();
    }
    
    @Test
    void navigateToAdminPanel() {
        loginAsAdmin("admin", "admin123");
        
        header
            .clickAdmin()
            .shouldHaveActiveLink("Админка");
        
        assert webdriver().driver().url().contains("/admin");
    }
    
    @Test
    void cartCounterUpdatesAfterAddingProduct() {
        loginAsUser("testuser", "password123");
        
        productListPage.addProductToCart(0);

        header.shouldHaveCartCount(1);
    
        productListPage.addProductToCart(1);

        header.shouldHaveCartCount(2);
    }
    
    @Test
    void logoutFunctionality() {
        loginAsUser("testuser", "password123");
        
        assert header.isUserLoggedIn();
        
        header.clickLogout();
        
        confirmAlert("Вы уверены, что хотите выйти?");
        
        header.shouldShowGuestMenu();
    }
    
    @Test
    void cancelLogout() {
        loginAsUser("testuser", "password123");
        
        header.clickLogout();
        
        dismissAlert("Вы уверены, что хотите выйти?");

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
        $("[data-testid='username-input']").setValue("testuser");
        $("[data-testid='password-input']").setValue("password123");
        $("[data-testid='login-button']").click();
        
        header.shouldShowUserMenu("testuser");
        у
        productListPage.addProductToCart(0);
        header.shouldHaveCartCount(1);
        
        header.clickLogout();
        confirmAlert("Вы уверены, что хотите выйти?");
        
        header.shouldShowGuestMenu();
    }
    
    private void confirmAlert(String expectedText) {
        switchTo().alert(alert -> {
            assert alert.getText().contains(expectedText);
            alert.accept();
        });
    }
    
    private void dismissAlert(String expectedText) {
        switchTo().alert(alert -> {
            assert alert.getText().contains(expectedText);
            alert.dismiss();
        });
    }
}
