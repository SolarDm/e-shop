package tests;

import org.junit.jupiter.api.Test;
import pages.OrderHistoryPage;

class OrderHistoryTests extends BaseTest {
    
    @Test
    void viewOrderHistory() {
        loginAsUser();
        
        new OrderHistoryPage()
            .open()
            .shouldHaveOrders(0);
    }
    
    @Test
    void filterOrdersByStatus() {
        loginAsUser();
        
        new OrderHistoryPage()
            .open()
            .filterByStatus("COMPLETED");
    }
}
