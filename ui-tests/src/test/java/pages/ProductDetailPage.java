package pages;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import org.openqa.selenium.Alert;

import java.time.Duration;

import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class ProductDetailPage {

    private final SelenideElement productTitle = $(".product-title");
    private final SelenideElement addToCartButton = $(".add-to-cart-btn");

    private final SelenideElement incrementButton = $(".quantity-btn:last-child");
    private final SelenideElement decrementButton = $(".quantity-btn:first-child");

    public ProductDetailPage openProductPage(String productId) {
        Selenide.open("/product/" + productId);

        productTitle.shouldBe(visible, Duration.ofSeconds(5));
        return this;
    }

    public ProductDetailPage addToCart() {
        addToCartButton
                .shouldBe(enabled, Duration.ofSeconds(5))
                .click();

        Alert alert = webdriver().driver().switchTo().alert();
        alert.accept();

        return this;
    }

    public ProductDetailPage increaseQuantity() {
        incrementButton
                .shouldBe(enabled, Duration.ofSeconds(5))
                .click();
        return this;
    }

    public ProductDetailPage shouldBeVisible() {
        $(".product-detail, .product-container, .product-content")
                .shouldBe(visible, Duration.ofSeconds(5));
        return this;
    }
}