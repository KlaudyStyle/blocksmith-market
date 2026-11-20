package com.blocksmith.market.catalog;

import java.net.URLDecoder;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

record ProductQuery(String search, String category, Sort sort, long page, int limit) {
    private static final Set<String> PARAMETER_NAMES = Set.of("search", "category", "sort", "page", "limit");
    private static final Set<String> CATEGORIES = Set.of("tools", "gameplay", "moderation", "world");
    private static final Pattern POSITIVE_INTEGER = Pattern.compile("[1-9][0-9]*");
    private static final Pattern SEARCH_PADDING = Pattern.compile("^[\\p{Z}\\uFEFF]+|[\\p{Z}\\uFEFF]+$");
    private static final long MAX_PAGE = 9_007_199_254_740_991L;
    private static final int MAX_LIMIT = 50;

    enum Sort {
        DEFAULT, PRICE_ASC, PRICE_DESC
    }

    static ProductQuery parse(String query) {
        Map<String, String> parameters = decodeQuery(query);
        String search = parameters.getOrDefault("search", "");
        if (search.length() > 100 || search.chars().anyMatch(character -> character < 32 || character == 127)) {
            throw new InvalidProductQuery("Поисковый запрос должен содержать не более 100 символов и не может включать управляющие символы.");
        }

        String category = parameters.get("category");
        if (category != null && !CATEGORIES.contains(category)) {
            throw new InvalidProductQuery("Неизвестная категория.");
        }

        Sort sort = switch (parameters.getOrDefault("sort", "default")) {
            case "default" -> Sort.DEFAULT;
            case "price-asc" -> Sort.PRICE_ASC;
            case "price-desc" -> Sort.PRICE_DESC;
            default -> throw new InvalidProductQuery("Неизвестная сортировка.");
        };
        long page = positiveInteger(parameters.getOrDefault("page", "1"), "page", MAX_PAGE);
        int limit = (int) positiveInteger(parameters.getOrDefault("limit", "6"), "limit", MAX_LIMIT);
        String normalizedSearch = SEARCH_PADDING.matcher(search).replaceAll("").toLowerCase(Locale.ROOT);
        return new ProductQuery(normalizedSearch, category, sort, page, limit);
    }

    private static Map<String, String> decodeQuery(String query) {
        if (query == null || query.isEmpty()) {
            return Map.of();
        }

        Map<String, String> parameters = new HashMap<>();
        try {
            for (String parameter : query.split("&")) {
                if (parameter.isEmpty()) {
                    continue;
                }
                String[] pair = parameter.split("=", 2);
                String name = decode(pair[0]);
                String value = pair.length == 2 ? decode(pair[1]) : "";
                if (!PARAMETER_NAMES.contains(name) || parameters.putIfAbsent(name, value) != null) {
                    throw new InvalidProductQuery("Запрос содержит неизвестный или повторяющийся параметр.");
                }
            }
        } catch (IllegalArgumentException | CharacterCodingException exception) {
            throw new InvalidProductQuery("Некорректная кодировка параметров запроса.");
        }
        return parameters;
    }

    private static String decode(String value) throws CharacterCodingException {
        byte[] bytes = URLDecoder.decode(value, StandardCharsets.ISO_8859_1).getBytes(StandardCharsets.ISO_8859_1);
        return StandardCharsets.UTF_8.newDecoder().decode(ByteBuffer.wrap(bytes)).toString();
    }

    private static long positiveInteger(String raw, String parameter, long max) {
        if (raw.length() <= Long.toString(max).length() && POSITIVE_INTEGER.matcher(raw).matches()) {
            long value = Long.parseLong(raw);
            if (value <= max) {
                return value;
            }
        }
        throw new InvalidProductQuery("Параметр %s должен быть целым числом от 1 до %d.".formatted(parameter, max));
    }
}

class InvalidProductQuery extends RuntimeException {
    InvalidProductQuery(String message) {
        super(message);
    }
}
