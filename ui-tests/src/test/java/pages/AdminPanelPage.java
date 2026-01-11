package pages;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import static com.codeborne.selenide.Selenide.*;

public class AdminPanelPage {
    
    private final SelenideElement dashboardTab = $(".sidebar-btn:nth-child(1)");
    private final SelenideElement ordersTab = $(".sidebar-btn:nth-child(2)");
    private final SelenideElement productsTab = $(".sidebar-btn:nth-child(3)");
    private final SelenideElement usersTab = $(".sidebar-btn:nth-child(4)");
    private final ElementsCollection statCards = $$(".stat-card");
    
    public AdminPanelPage open() {
        Selenide.open("/admin");
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
        statCards.shouldHave(CollectionCondition.size(3));
        return this;
    }
}
