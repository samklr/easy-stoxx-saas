package com.hotelsaas.backend.repository;

import com.hotelsaas.backend.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
}
