package pages;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.*;

public class ProductListPage {
    private final SelenideElement pageHeader = $(".page-header");
    private final SelenideElement pageTitle = pageHeader.$("h1");
    private final SelenideElement productsCount = pageHeader.$("p");
    private final SelenideElement searchInput = $(".search-input");
    private final SelenideElement searchButton = $(".search-btn");
    private final SelenideElement toggleFiltersButton = $(".toggle-filters-btn");
    private final SelenideElement filtersPanel = $(".filters-panel");
    private final SelenideElement clearFiltersButton = $(".clear-filters-btn");
    
    private final ElementsCollection productCards = $$(".product-card");
    private final ElementsCollection categoryButtons = $$(".category-btn");
    private final SelenideElement sortSelect = $(".sort-select");
    private final ElementsCollection priceInputs = $$(".price-input");
    private final SelenideElement minPriceInput = priceInputs.get(0);
    private final SelenideElement maxPriceInput = priceInputs.get(1);
    private final SelenideElement pagination = $(".pagination");
    private final SelenideElement emptyProducts = $(".empty-products");
    
    public ProductListPage open() {
        Selenide.open("/");
        return this;
    }
    
    public ProductListPage searchProduct(String productName) {
        searchInput.setValue(productName);
        searchButton.click();
        waitForLoading();
        return this;
    }
    
    public ProductListPage searchProductByEnter(String productName) {
        searchInput.setValue(productName).pressEnter();
        waitForLoading();
        return this;
    }
    
    public ProductListPage toggleFilters() {
        toggleFiltersButton.click();
        return this;
    }
    
    public ProductListPage clearAllFilters() {
        clearFiltersButton.click();
        waitForLoading();
        return this;
    }
    
    public ProductListPage selectCategory(String categoryName) {
        toggleFilters();
        categoryButtons.find(text(categoryName)).click();
        waitForLoading();
        return this;
    }
    
    public ProductListPage sortBy(String sortOption) {
        toggleFilters();
        sortSelect.selectOption(sortOption);
        waitForLoading();
        return this;
    }
    
    public ProductListPage setPriceRange(int min, int max) {
        toggleFilters();
        minPriceInput.setValue(String.valueOf(min));
        maxPriceInput.setValue(String.valueOf(max)).pressEnter();
        waitForLoading();
        return this;
    }
    
    public ProductListPage addProductToCart(int productIndex) {
        productCards.get(productIndex)
            .$(".add-to-cart-btn")
            .click();
        return this;
    }
    
    public ProductDetailPage openProductDetails(int productIndex) {
        productCards.get(productIndex)
            .$(".view-details-btn")
            .click();
        return new ProductDetailPage();
    }
    
    public String getProductName(int productIndex) {
        return productCards.get(productIndex)
            .$(".product-title")
            .getText();
    }
    
    public String getProductPrice(int productIndex) {
        return productCards.get(productIndex)
            .$(".price-value")
            .getText()
            .replace(" ₽", "");
    }

    public ProductListPage goToPage(int pageNumber) {
        if (pagination.exists()) {
            pagination
                .$$(".pagination-btn")
                .find(text(String.valueOf(pageNumber)))
                .click();
            waitForLoading();
        }
        return this;
    }
    
    public ProductListPage shouldHaveTitle(String expectedTitle) {
        pageTitle.shouldHave(text(expectedTitle));
        return this;
    }
    
    public ProductListPage shouldHaveProductsCount(int expectedCount) {
        productCards.shouldHaveSize(expectedCount);
        return this;
    }
    
    public ProductListPage shouldHaveProductWithName(String productName) {
        productCards.find(text(productName)).shouldBe(visible);
        return this;
    }
    
    public ProductListPage shouldNotHaveProductWithName(String productName) {
        productCards.find(text(productName)).shouldNotBe(visible);
        return this;
    }
    
    public ProductListPage shouldHavePriceInRange(int minPrice, int maxPrice) {
        for (SelenideElement card : productCards) {
            String priceText = card.$(".price-value").getText();
            int price = Integer.parseInt(priceText.replaceAll("[^0-9]", ""));
            assert price >= minPrice && price <= maxPrice : 
                String.format("Цена %d вне диапазона %d-%d", price, minPrice, maxPrice);
        }
        return this;
    }
    
    public ProductListPage shouldShowEmptyState() {
        emptyProducts.shouldBe(visible);
        return this;
    }
    
    public ProductListPage shouldShowFiltersPanel(boolean expectedVisible) {
        if (expectedVisible) {
            filtersPanel.shouldBe(visible);
        } else {
            filtersPanel.shouldNotBe(visible);
        }
        return this;
    }
    
    public ProductListPage shouldShowPagination() {
        pagination.shouldBe(visible);
        return this;
    }
    
    
    public ProductListPage waitForLoading() {
        $(".loading").shouldNotBe(visible);
        return this;
    }
    
    public boolean hasError() {
        return $(".error").exists();
    }
    
    public String getErrorMessage() {
        return $(".error p").getText();
    }
    
    public ProductListPage retryLoading() {
        $(".retry-btn").click();
        waitForLoading();
        return this;
    }
    
    public int getTotalProductsFromHeader() {
        String countText = productsCount.getText();
        return Integer.parseInt(countText.replaceAll("[^0-9]", ""));
    }
    
    public int getDisplayedProductsCount() {
        return productCards.size();
    }
    
    public boolean isFiltersPanelVisible() {
        return filtersPanel.isDisplayed();
    }
    
    public String getSelectedSortOption() {
        return sortSelect.getSelectedOptionText();
    }
}