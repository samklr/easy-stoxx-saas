package com.hotelsaas.backend.repository;

import com.hotelsaas.backend.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    List<InventoryItem> findByTenantId(UUID tenantId);
}
