package tests;

import org.junit.jupiter.api.Test;
import pages.AdminPanelPage;

class AdminPanelTests extends BaseTest {
    
    @Test
    void adminDashboardLoads() {
        loginAsAdmin();
        
        new AdminPanelPage()
            .open()
            .shouldShowStats();
    }
    
    @Test
    void navigateAdminTabs() {
        loginAsAdmin();
        
        new AdminPanelPage()
            .open()
            .openOrders()
            .openProducts()
            .openUsers()
            .openDashboard();
    }
}
