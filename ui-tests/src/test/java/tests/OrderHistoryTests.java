package tests;

import org.junit.jupiter.api.Test;
import pages.CartPage;
import pages.OrderHistoryPage;
import pages.ProductDetailPage;

import static com.codeborne.selenide.Selenide.*;

class OrderHistoryTests extends BaseTest {

    @Test
    void viewOrderHistory() {
        loginAsUser();

        createOrder();

        new OrderHistoryPage()
                .open()
                .shouldHaveOrders();
    }

    @Test
    void filterOrdersByStatus() {
        loginAsUser();

        createOrder();

        new OrderHistoryPage()
                .open()
                .filterByStatus("NEW");
    }

    private void createOrder() {
        new ProductDetailPage()
                .openProductPage("1")
                .addToCart();

        open("/");

        new CartPage()
                .open()
                .checkout();

        open("/");
    }
}
