package com.blocksmith.market.catalog;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/products", "/api/products"})
public class ProductController {
    private final ProductCatalog catalog;

    public ProductController(ProductCatalog catalog) {
        this.catalog = catalog;
    }

    @GetMapping({"", "/"})
    public ResponseEntity<ProductCatalog.Page> products(HttpServletRequest request) {
        var page = catalog.find(ProductQuery.parse(request.getQueryString()));
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(page);
    }

    @GetMapping({"/{slug}", "/{slug}/"})
    public ResponseEntity<?> product(@PathVariable("slug") String slug) {
        var product = catalog.findBySlug(slug);
        if (product.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("message", "Плагин не найден."));
        }
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(product.get());
    }

    @ExceptionHandler(InvalidProductQuery.class)
    public ResponseEntity<Map<String, String>> invalidQuery(InvalidProductQuery exception) {
        return ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("message", exception.getMessage()));
    }
}
