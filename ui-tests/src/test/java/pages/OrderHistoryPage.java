package pages;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

import java.time.Duration;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class OrderHistoryPage {
    
    private final ElementsCollection orderCards = $$(".order-card");
    private final SelenideElement statusFilter = $("#status");
    
    public OrderHistoryPage open() {
        Selenide.open("/orders");
        return this;
    }
    
    public OrderHistoryPage shouldHaveOrders(){
        orderCards.shouldHave(sizeGreaterThan(0));
        return this;
    }

    public OrderHistoryPage filterByStatus(String statusValue) {
        statusFilter.shouldBe(visible, Duration.ofSeconds(5));
        statusFilter.selectOptionByValue(statusValue);
        $(".loading-spinner").shouldNotBe(visible);

        return this;
    }
}
