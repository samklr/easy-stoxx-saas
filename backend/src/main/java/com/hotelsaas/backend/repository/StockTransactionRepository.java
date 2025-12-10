package com.hotelsaas.backend.repository;

import com.hotelsaas.backend.model.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, UUID> {
    List<StockTransaction> findByTenantId(UUID tenantId);
}
