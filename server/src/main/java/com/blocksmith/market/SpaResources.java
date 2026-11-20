package com.blocksmith.market;

import java.util.List;
import java.util.Set;

import jakarta.servlet.http.HttpServletRequest;
import org.jspecify.annotations.Nullable;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

@Configuration(proxyBeanMethods = false)
class SpaResources implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(false)
                .addResolver(new SpaResourceResolver());
    }

    private static final class SpaResourceResolver extends PathResourceResolver {
        private static final Set<String> RESERVED_SECTIONS = Set.of("api", "products", "error", "assets", "art");

        @Override
        protected @Nullable Resource resolveResourceInternal(
                @Nullable HttpServletRequest request,
                String requestPath,
                List<? extends Resource> locations,
                ResourceResolverChain chain) {
            Resource resource = super.resolveResourceInternal(request, requestPath, locations, chain);
            if (resource != null || !isSpaPath(requestPath)) {
                return resource;
            }
            return super.resolveResourceInternal(request, "index.html", locations, chain);
        }

        private boolean isSpaPath(String requestPath) {
            String path = requestPath.startsWith("/") ? requestPath.substring(1) : requestPath;
            int slash = path.indexOf('/');
            String section = slash < 0 ? path : path.substring(0, slash);
            return !RESERVED_SECTIONS.contains(section) && StringUtils.getFilenameExtension(path) == null;
        }
    }
}
