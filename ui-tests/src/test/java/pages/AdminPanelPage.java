package pages;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class AdminPanelPage {
    
    private final SelenideElement dashboardTab = $(".sidebar-btn:nth-child(1)");
    private final SelenideElement ordersTab = $(".sidebar-btn:nth-child(2)");
    private final SelenideElement productsTab = $(".sidebar-btn:nth-child(3)");
    private final SelenideElement usersTab = $(".sidebar-btn:nth-child(4)");
    private final ElementsCollection statCards = $$(".stat-card");
    
    public AdminPanelPage open() {
        open("/admin");
        return this;
    }
    
    public AdminPanelPage openDashboard() {
        dashboardTab.click();
        return this;
    }
    
    public AdminPanelPage openOrders() {
        ordersTab.click();
        return this;
    }
    
    public AdminPanelPage openProducts() {
        productsTab.click();
        return this;
    }
    
    public AdminPanelPage openUsers() {
        usersTab.click();
        return this;
    }
    
    public AdminPanelPage shouldShowStats() {
        statCards.shouldHaveSize(3); // Users, Orders, Products
        return this;
    }
    
    public AdminPanelPage createProduct(String name, String description, String price) {
        $("[placeholder='Название товара']").setValue(name);
        $("[placeholder='Описание товара']").setValue(description);
        $("[placeholder='Цена']").setValue(price);
        $(".btn-create").click();
        return this;
    }
}
