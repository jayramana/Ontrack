using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class InventoryItem
    {
        public int Id { get; set; }

        public int WarehouseId { get; set; }
        [ForeignKey("WarehouseId")]
        public Warehouse? Warehouse { get; set; }

        [Required]
        public string SKU { get; set; } = string.Empty; // Stock Keeping Unit

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int Quantity { get; set; } = 0;

        public string UnitType { get; set; } = "pieces"; // pieces, pallets, cubic meters

        public int MinStockLevel { get; set; } = 10; // Minimum stock before alert
        public int ReorderPoint { get; set; } = 20; // When to reorder

        public DateTime LastRestockedAt { get; set; } = DateTime.UtcNow;
    }

    public class InventoryTransaction
    {
        public int Id { get; set; }

        public int InventoryItemId { get; set; }
        [ForeignKey("InventoryItemId")]
        public InventoryItem? InventoryItem { get; set; }

        [Required]
        public string Type { get; set; } = string.Empty; // Inbound, Outbound, Transfer

        public int Quantity { get; set; }

        public int? OrderId { get; set; }
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        public int? FromWarehouseId { get; set; }
        public int? ToWarehouseId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? Notes { get; set; }
    }
}
