package tests;

import org.junit.jupiter.api.Test;
import pages.ProductDetailPage;
import pages.HeaderPage;

class ProductDetailTests extends BaseTest {
    
    @Test
    void viewProductDetails() {
        open("/");
        String productId = $(".product-card").getAttribute("href").split("/")[2];
        
        new ProductDetailPage()
            .open(productId)
            .shouldShowSuccessMessage();
    }
    
    @Test
    void addProductToCartFromDetailPage() {
        loginAsUser();
        
        open("/");
        String productId = $(".product-card").getAttribute("href").split("/")[2];
        
        new ProductDetailPage()
            .open(productId)
            .increaseQuantity()
            .addToCart();
        
        new HeaderPage()
            .shouldHaveCartCount(2); 
    }
}
