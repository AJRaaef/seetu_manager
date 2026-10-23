package com.seettu.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "shop_name", nullable = false, length = 150)
    private String name;

    @Column(name = "shop_owner_name", length = 150)
    private String shopOwnerName;

    @Column(name = "shop_type", length = 100)
    private String shopType;

    @Column(name = "shop_register_number", length = 100)
    private String shopRegisterNumber;

    @Column(name = "shop_email", length = 150)
    private String shopEmail;

    @Column(name = "shop_address", length = 255)
    private String address;

    @Column(name = "contact_number", length = 50)
    private String contactNumber;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper aliases for JSON matching ER diagram exactly
    @JsonProperty("shopId")
    public Long getShopId() {
        return id;
    }

    public void setShopId(Long shopId) {
        this.id = shopId;
    }

    @JsonProperty("shopName")
    public String getShopName() {
        return name;
    }

    public void setShopName(String shopName) {
        this.name = shopName;
    }

    @JsonProperty("shopAddress")
    public String getShopAddress() {
        return address;
    }

    public void setShopAddress(String shopAddress) {
        this.address = shopAddress;
    }

    @JsonProperty("createAt")
    public LocalDateTime getCreateAt() {
        return createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null || status.trim().isEmpty()) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
