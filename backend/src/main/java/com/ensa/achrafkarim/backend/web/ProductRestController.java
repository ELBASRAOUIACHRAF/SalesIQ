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

}
