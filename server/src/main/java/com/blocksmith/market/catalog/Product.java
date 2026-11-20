package com.blocksmith.market.catalog;

import java.util.List;

public record Product(
        String slug,
        String name,
        String summary,
        String description,
        int price,
        String version,
        String category,
        String artwork,
        List<String> features
) {
    public Product {
        features = List.copyOf(features);
    }
}
