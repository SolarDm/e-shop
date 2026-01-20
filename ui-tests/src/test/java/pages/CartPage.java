package pages;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

import java.time.Duration;

import static com.codeborne.selenide.CollectionCondition.size;
import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class CartPage {
    
    private final ElementsCollection cartItems = $$(".cart-item");
    private final SelenideElement checkoutButton = $(".checkout-btn");
    private final SelenideElement emptyCartMessage = $(".empty-cart");

    private final SelenideElement deliveryModal = $(".delivery-modal");
    private final SelenideElement shippingAddressInput = $("#shippingAddress");
    private final SelenideElement recipientNameInput = $("#recipientName");
    private final SelenideElement recipientPhoneInput = $("#recipientPhone");
    private final SelenideElement shippingMethodSelect = $("#shippingMethod");
    private final SelenideElement deliveryNotesTextarea = $("#deliveryNotes");
    private final SelenideElement confirmOrderButton = $(".confirm-btn");
    
    public CartPage open() {
        Selenide.open("/cart");
        return this;
    }
    
    public CartPage shouldHaveItems(int count) {
        cartItems.shouldHave(size(count));
        return this;
    }
    
    public CartPage removeItem(int index) {
        cartItems.get(index).$(".remove-btn").click();
        return this;
    }
    
    public CartPage checkout() {
        checkoutButton.click();
        
        deliveryModal.shouldBe(visible, Duration.ofSeconds(5));

        fillDeliveryInfo(
            "г. Москва, ул. Тверская, д. 10, кв. 25",
            "Иван Иванов",
            "+79991234567",
            "STANDARD",
            "Позвонить за 15 минут"
        );
        
        confirmOrderButton.click();

        deliveryModal.shouldNotBe(visible, Duration.ofSeconds(5));
        
        try {
            sleep(2000);
        } catch (Exception ignored) {
        }
        
        return this;
    }

    private void fillDeliveryInfo(String address, String name, String phone, 
                                    String shippingMethod, String notes) {
        shippingAddressInput
            .shouldBe(visible, Duration.ofSeconds(2))
            .setValue(address);

        recipientNameInput
            .shouldBe(visible, Duration.ofSeconds(2))
            .setValue(name);

        recipientPhoneInput
            .shouldBe(visible, Duration.ofSeconds(2))
            .setValue(phone);

        if (shippingMethod != null) {
            shippingMethodSelect.selectOptionContainingText(getShippingMethodText(shippingMethod));
        }

        if (notes != null && !notes.isEmpty()) {
            deliveryNotesTextarea.setValue(notes);
        }
    }

    private String getShippingMethodText(String method) {
        return switch (method) {
            case "EXPRESS" -> "Экспресс доставка (500 ₽, 1-2 дня)";
            case "PICKUP" -> "Самовывоз (бесплатно)";
            default -> "Стандартная доставка (250 ₽, 3-5 дней)";
        };
    }
    
    public CartPage shouldBeEmpty() {
        emptyCartMessage.shouldBe(visible);
        return this;
    }
}
