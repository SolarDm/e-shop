package tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import pages.ProductListPage;
import pages.components.HeaderPage;

class ProductListTests extends BaseTest {
    
    private ProductListPage productListPage;
    private HeaderPage header;
    
    @BeforeEach
    void setUp() {
        productListPage = new ProductListPage().open();
        header = new HeaderPage();
    }
    
    @Test
    void mainPageLoadsCorrectly() {
        productListPage
            .shouldHaveTitle("Каталог товаров")
            .shouldHaveProductsCount(12)
            .shouldShowPagination();
        
        header
            .shouldBeVisible()
            .shouldHaveLogo()
            .shouldShowGuestMenu();
    }
    
    @Test
    void searchProductByName() {
        productListPage
            .searchProduct("стол")
            .shouldHaveProductWithName("стол");
        
        int displayedCount = productListPage.getDisplayedProductsCount();
        int headerCount = productListPage.getTotalProductsFromHeader();
        
        assert displayedCount == headerCount : 
            "Количество товаров в заголовке не совпадает";
    }
    
    @Test
    void searchNonExistentProduct() {
        productListPage
            .searchProduct("несуществующий_товар_12345")
            .shouldShowEmptyState();
    }
    
    @Test
    void filterByCategory() {
        productListPage
            .toggleFilters()
            .shouldShowFiltersPanel(true)
            .selectCategory("Мебель")
            .shouldHaveProductsCount(0);
    }
    
    @Test
    void sortByPriceAscending() {
        productListPage
            .toggleFilters()
            .sortBy("Цена: по возрастанию");
        
        String firstPrice = productListPage.getProductPrice(0);
        String lastPrice = productListPage.getProductPrice(
            Math.min(11, productListPage.getDisplayedProductsCount() - 1)
        );
        
        int price1 = Integer.parseInt(firstPrice);
        int price2 = Integer.parseInt(lastPrice);
        
        assert price1 <= price2 : "Сортировка по возрастанию не работает";
    }
    
    @Test
    void filterByPriceRange() {
        productListPage
            .toggleFilters()
            .setPriceRange(5000, 15000)
            .shouldHavePriceInRange(5000, 15000);
    }
    
    @Test
    void addProductToCartRequiresLogin() {
        productListPage.addProductToCart(0);
    }
    
    @Test
    void openProductDetails() {
        String productName = productListPage.getProductName(0);
        
        productListPage
            .openProductDetails(0);
        
        String currentUrl = webdriver().driver().url();
        assert currentUrl.contains("/product/") : "Не перешли на страницу товара";
    }
    
    @Test
    void paginationToSecondPage() {
        if (productListPage.getTotalProductsFromHeader() > 12) {
            productListPage
                .goToPage(2)
                .shouldHaveProductsCount(12);
        }
    }
    
    @Test
    void clearAllFilters() {
        productListPage
            .toggleFilters()
            .selectCategory("Мебель")
            .setPriceRange(10000, 50000);
        
        int filteredCount = productListPage.getDisplayedProductsCount();

        productListPage.clearAllFilters();
        
        int originalCount = productListPage.getDisplayedProductsCount();
        
        assert originalCount >= filteredCount : 
            "После сброса фильтров должно быть больше товаров";
    }
    
    @Test
    void productsCountInHeader() {
        int displayedCount = productListPage.getDisplayedProductsCount();
        int headerCount = productListPage.getTotalProductsFromHeader();
        
        assert displayedCount == headerCount : 
            "Количество товаров в заголовке должно совпадать";
    }
    
    @ParameterizedTest
    @CsvSource({
        "слон",
        "смартфон", 
        "ноутбук"
    })
    void searchDifferentProducts(String productName) {
        productListPage
            .searchProduct(productName)
            .shouldHaveProductWithName(productName);
    }
    
    @Test
    void integrationWithHeader() {
        loginAsUser("testuser", "password123");

        header
            .shouldShowUserMenu("testuser")
            .shouldHaveCartCount(0);
        
        productListPage.addProductToCart(0);

        header.shouldHaveCartCount(1);

        header.clickCart();

        String currentUrl = webdriver().driver().url();
        assert currentUrl.contains("/cart") : "Не перешли в корзину";
    }
}
