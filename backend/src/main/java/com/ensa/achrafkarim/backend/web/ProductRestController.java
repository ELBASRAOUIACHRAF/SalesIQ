package com.ensa.achrafkarim.backend.web;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("products")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ProductRestController {

    private ProductService productService;


    @GetMapping("/getOne/{productId}")
    public ProductDto getProduct(@PathVariable Long productId) {return productService.getProduct(productId); }

    @GetMapping("/getAll")
    public List<ProductDto>  getProducts(){return productService.listProducts(); }

    @GetMapping("/deleteOne/{productId}")
    public void deleteProduct(@PathVariable Long productId) {productService.deleteProduct(productId);}

    @PostMapping("/addOne")
    public ProductDto addProduct(@RequestBody ProductDto productDto,@RequestParam Long categoryId)
    {
        return productService.createProduct(productDto, categoryId);
    }

    @GetMapping("/sortedproducts/{sortMethod}")
    public List<ProductDto> sortedProducts(@PathVariable Boolean sortMethod){
        return productService.getProductsSortedByPrice(sortMethod);
    }

    @GetMapping("/stockvalidation/{productID}")
    public boolean isProductInStock(@PathVariable Long productID){
        return productService.isProductInStock(productID);
    }

    @GetMapping("/stockcount/{productID}")
    public long productStock(@PathVariable Long productID){
        return productService.getAvailableStock(productID);
    }

    @GetMapping("/pricefilter")
    public List<ProductDto> filterByprice(@RequestParam double minPrice,@RequestParam double maxPrice){
        return productService.filterProductsByPriceRange(minPrice,maxPrice);
    }

    @PutMapping("/updatestock")
    public ProductDto updateStock(@RequestParam Long productId,@RequestParam int quantity,@RequestParam boolean increase){
        if (increase) return productService.increaseStock(productId, quantity);
        else return productService.decreaseStock(productId, quantity);
    }

    @GetMapping("/categoryproducts/{categoryId}")
    public List<ProductDto> getCategoryProducts(@PathVariable Long categoryId){
        return productService.getProductsByCategory(categoryId);
    }

    @PutMapping("/updateproduct")
    public ProductDto updateProduct(@RequestBody ProductDto productDto){
        return productService.updateProduct(productDto);
    }

    @GetMapping("/lowstockalert/{productId}")
    public boolean lowstockalert(@PathVariable Long productId){
        return productService.isLowStock(productId);
    }

    @GetMapping("/lowStockProducts")
    public List<ProductDto> lowStockProducts(){
        return productService.getLowStockProducts();
    }

    @GetMapping("/availabaleProducts")
    public List<ProductDto>  availabaleProducts(){
        return productService.getAvailableProducts();
    }

    @GetMapping("/bestSellingProducts/{limit}")
    public List<ProductDto>  bestSellingProducts(int limit){
        return productService.getBestSellingProducts(limit);
    }

    @GetMapping("/leastSellingProducts/{limit}")
    public List<ProductDto> leastSellingProducts(int limit){
        return productService.getLeastSellingProducts(limit);
    }

    @GetMapping("/noSalesProducts")
    public List<ProductDto>  noSalesProducts(){
        return productService.getProductsWithNoSales();
    }

    @GetMapping("/unavailabaleProducts")
    public List<ProductDto> getUnavailabaleProducts(){
        return productService.getUnavailableProducts();
    }

    @GetMapping("/productsByFilter")
    public List<ProductDto>  productsByFilter(@RequestParam String name,
                                              @RequestParam Long categoryId,
                                              @RequestParam Double minPrice,
                                              @RequestParam Double maxPrice){
        return productService.filterProducts(name, categoryId, minPrice, maxPrice);
    }

    @GetMapping("/topPofitProducts/{limit}")
    public List<ProductDto> getTopProfitProducts(@PathVariable Integer limit){
        return productService.getTopProfitProducts(limit);
    }

    @GetMapping("/productProfit/{productId}")
    public double getProductProfit(@PathVariable Long productId){
        return productService.getProductRevenue(productId);
    }

    @PutMapping("/markProductAvailable")
    public void markProductAvailable(@RequestBody ProductDto productDto) {
        productService.markProductAsAvailable(productDto);
    }

    @PutMapping("/markProductUnAvailable")
    public void markProductUnAvailable(@RequestBody ProductDto productDto) {
        productService.markProductAsUnavailable(productDto);
    }

    @PutMapping(
            value = "/addProductImages/{productId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ProductDto addProductImages(
            @PathVariable("productId") Long productId,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        return productService.addImageToProduct(productId, file);
    }

    @PostMapping("/by-categories")
    public List<ProductDto> getProductsByCategories(
            @RequestBody List<Long> categoryIds
    ) {
        return productService.getProductsByCategories(categoryIds);
    }
}
