package com.blocksmith.market.catalog;

import java.io.IOException;
import java.io.InputStream;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

@Service
public class ProductCatalog {
    private static final Comparator<Product> BY_PRICE = Comparator.comparingInt(Product::price);

    private final List<Product> products;
    private final Map<String, Product> bySlug;

    public ProductCatalog(JsonMapper mapper) throws IOException {
        try (InputStream input = new ClassPathResource("data/products.json").getInputStream()) {
            products = List.copyOf(mapper.readValue(input, new TypeReference<List<Product>>() {}));
        }
        bySlug = products.stream().collect(Collectors.toUnmodifiableMap(Product::slug, Function.identity()));
    }

    Page find(ProductQuery query) {
        Stream<Product> matches = products.stream()
                .filter(product -> query.category() == null || query.category().equals(product.category()))
                .filter(product -> product.name().toLowerCase(Locale.ROOT).contains(query.search()));

        List<Product> filtered = switch (query.sort()) {
            case DEFAULT -> matches.toList();
            case PRICE_ASC -> matches.sorted(BY_PRICE).toList();
            case PRICE_DESC -> matches.sorted(BY_PRICE.reversed()).toList();
        };

        int total = filtered.size();
        long start = (query.page() - 1) * query.limit();
        if (start >= total) {
            return new Page(List.of(), total, false);
        }

        int end = (int) Math.min(total, start + query.limit());
        return new Page(filtered.subList((int) start, end), total, end < total);
    }

    Optional<Product> findBySlug(String slug) {
        return Optional.ofNullable(bySlug.get(slug));
    }

    public record Page(List<Product> items, int total, boolean hasMore) {}
}
