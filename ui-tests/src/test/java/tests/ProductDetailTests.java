package tests;

import org.junit.jupiter.api.Test;
import pages.ProductDetailPage;
import pages.components.HeaderPage;

import static com.codeborne.selenide.Selenide.*;

class ProductDetailTests extends BaseTest {

    @Test
    void viewProductDetails() {
        open("/");
        String productId = $(".product-link").getAttribute("href").split("/")[4];

        new ProductDetailPage()
            .openProductPage(productId)
            .shouldBeVisible();
    }
    
    @Test
    void addProductToCartFromDetailPage() {
        loginAsUser();
        
        open("/");
        String productId = $(".product-link").getAttribute("href").split("/")[4];
        
        new ProductDetailPage()
            .openProductPage(productId)
            .increaseQuantity()
            .addToCart();

        refresh();
        
        new HeaderPage()
            .shouldHaveCartCount(2); 
    }
}
