package pages;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class OrderHistoryPage {
    
    private final ElementsCollection orderCards = $$(".order-card");
    private final SelenideElement statusFilter = $("#status");
    private final SelenideElement emptyOrdersMessage = $(".empty-orders");
    
    public OrderHistoryPage open() {
        open("/orders");
        return this;
    }
    
    public OrderHistoryPage shouldHaveOrders(int count) {
        orderCards.shouldHaveSize(count);
        return this;
    }
    
    public OrderHistoryPage filterByStatus(String status) {
        statusFilter.selectOption(status);
        return this;
    }
    
    public OrderHistoryPage reorder(int orderIndex) {
        orderCards.get(orderIndex).$(".reorder-btn").click();
        return this;
    }
    
    public OrderHistoryPage shouldBeEmpty() {
        emptyOrdersMessage.shouldBe(visible);
        return this;
    }
    
    public String getOrderStatus(int index) {
        return orderCards.get(index).$(".order-status").getText();
    }
}
