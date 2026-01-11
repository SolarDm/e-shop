package tests;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.Alert;
import pages.CartPage;
import pages.ProductListPage;

import static com.codeborne.selenide.Selenide.webdriver;

class CartTests extends BaseTest {
    
    @Test
    void viewEmptyCart() {
        loginAsUser();
        
        new CartPage()
            .open()
            .shouldBeEmpty();
    }
    
    @Test
    void addItemToCartAndView() {
        loginAsUser();
        
        new ProductListPage()
            .open()
            .addProductToCart(1);

        Alert alert = webdriver().driver().switchTo().alert();
        alert.accept();
        
        new CartPage()
            .open()
            .shouldHaveItems(1);
    }
    
    @Test
    void removeItemFromCart() {
        loginAsUser();
        
        new ProductListPage()
            .open()
            .addProductToCart(1);

        Alert alert = webdriver().driver().switchTo().alert();
        alert.accept();
        
        new CartPage()
            .open()
            .removeItem(0)
            .shouldBeEmpty();
    }
}
