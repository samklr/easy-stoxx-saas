package com.hotelsaas.backend.repository;

import com.hotelsaas.backend.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    List<Supplier> findByTenantId(UUID tenantId);
}
