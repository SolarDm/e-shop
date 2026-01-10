package pages;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class CartPage {
    
    private final ElementsCollection cartItems = $$(".cart-item");
    private final SelenideElement checkoutButton = $(".checkout-btn");
    private final SelenideElement emptyCartMessage = $(".empty-cart");
    private final SelenideElement continueShoppingButton = $(".continue-shopping");
    
    public CartPage open() {
        open("/cart");
        return this;
    }
    
    public CartPage shouldHaveItems(int count) {
        cartItems.shouldHaveSize(count);
        return this;
    }
    
    public CartPage removeItem(int index) {
        cartItems.get(index).$(".remove-btn").click();
        return this;
    }
    
    public CartPage checkout() {
        checkoutButton.click();
        return this;
    }
    
    public CartPage shouldBeEmpty() {
        emptyCartMessage.shouldBe(visible);
        return this;
    }
    
    public CartPage continueShopping() {
        continueShoppingButton.click();
        return this;
    }
    
    public int getItemsCount() {
        return cartItems.size();
    }
    
    public String getItemName(int index) {
        return cartItems.get(index).$("h3").getText();
    }
}
