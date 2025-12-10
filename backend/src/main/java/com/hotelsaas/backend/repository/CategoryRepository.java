package com.hotelsaas.backend.repository;

import com.hotelsaas.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByTenantId(UUID tenantId);
}
