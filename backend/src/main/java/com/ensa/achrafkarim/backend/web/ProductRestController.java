package com.ensa.achrafkarim.backend.web;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("products")
@AllArgsConstructor
public class ProductRestController {

    private ProductService productService;


    @GetMapping("/getOne/{productId}")
    public ProductDto getProduct(@PathVariable Long productId) {return productService.getProduct(productId); }

    @GetMapping("/getAll")
    public List<ProductDto>  getProducts(){return productService.listProducts(); }

    @GetMapping("/deleteOne/{productId}")
    public void deleteProduct(@PathVariable Long productId) {productService.deleteProduct(productId);}

    @PostMapping("/addOne")
    public ProductDto addProduct(@RequestBody ProductDto productDto)
    {
        return productService.createProduct(productDto);
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
    public List<ProductDto>  leastSellingProducts(int limit){
        return productService.getLeastSellingProducts(limit);
    }

    @GetMapping("/noSalesProducts")
    public List<ProductDto>  noSalesProducts(){
        return productService.getProductsWithNoSales();
    }

    @GetMapping("/unAvailabaleProducts")
    public List<ProductDto>  unAvailabaleProducts(){
        return productService.getUnavailableProducts();
    }

    @GetMapping("/productsByFilter")
    public List<ProductDto>  productsByFilter(@RequestParam String name,
                                              @RequestParam Long categoryId,
                                              @RequestParam Double minPrice,
                                              @RequestParam Double maxPrice){
        return productService.filterProducts(name, categoryId, minPrice, maxPrice);
    }

    @GetMapping("/topPofitProducts")
    public List<ProductDto>  topPofitProducts(){
        return productService.getTopProfitProduct();
    }

    @PutMapping("/markProductAvailable/{productaId}")
    public void markProductAvailable(@PathVariable Long productaId){
        productService.markProductAsAvailable(productaId);
    }

    @PutMapping("/markProductUnAvailable/{productaId}")
    public void markProductUnAvailable(@PathVariable Long productaId){
        productService.markProductAsUnavailable(productaId);
    }

    @PostMapping("/createProductsBulk")
    public List<ProductDto>  createProductsBulk(@RequestBody List<ProductDto> products){
        return productService.createProductsBulk(products);
    }

    @DeleteMapping("/deleteProductsBulk")
    public void  deleteProductsBulk(@RequestBody List<Long> products){
        productService.deleteProductsBulk(products);
    }

}
