package tests;

import org.junit.jupiter.api.Test;
import pages.CartPage;
import pages.ProductListPage;

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
            .addProductToCart(0);
        
        new CartPage()
            .open()
            .shouldHaveItems(1);
    }
    
    @Test
    void removeItemFromCart() {
        loginAsUser();
        
        new ProductListPage()
            .open()
            .addProductToCart(0);
        
        new CartPage()
            .open()
            .removeItem(0)
            .shouldBeEmpty();
    }
}
