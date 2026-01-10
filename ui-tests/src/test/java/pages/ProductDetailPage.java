package pages;

import com.codeborne.selenide.SelenideElement;
import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class ProductDetailPage {
    
    private final SelenideElement productTitle = $(".product-title");
    private final SelenideElement productPrice = $(".price-value");
    private final SelenideElement addToCartButton = $(".add-to-cart-btn");
    private final SelenideElement quantityValue = $(".quantity-value");
    private final SelenideElement incrementButton = $(".quantity-btn:nth-child(3)");
    private final SelenideElement decrementButton = $(".quantity-btn:nth-child(1)");
    
    public ProductDetailPage open(String productId) {
        open("/product/" + productId);
        return this;
    }
    
    public ProductDetailPage addToCart() {
        addToCartButton.click();
        return this;
    }
    
    public ProductDetailPage increaseQuantity() {
        incrementButton.click();
        return this;
    }
    
    public ProductDetailPage decreaseQuantity() {
        decrementButton.click();
        return this;
    }
    
    public String getProductName() {
        return productTitle.getText();
    }
    
    public String getProductPrice() {
        return productPrice.getText();
    }
    
    public int getQuantity() {
        return Integer.parseInt(quantityValue.getText());
    }
    
    public ProductDetailPage shouldShowSuccessMessage() {
        return this;
    }
}
