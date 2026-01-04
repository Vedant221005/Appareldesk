# Step 19: Bulk Operations - Implementation Guide

## Overview
Bulk operations allow administrators to efficiently manage multiple products and orders simultaneously. This feature includes bulk updates, CSV import, bulk delete, and comprehensive UI for selection and action management.

## Features Implemented

### 1. Bulk Product Operations

#### API Endpoints

**POST /api/admin/products/bulk**
- Bulk update multiple products
- Fields: price, stock, category, type, isPublished
- Validation with Zod schema
- Returns update count and success message

**DELETE /api/admin/products/bulk?id={id}&id={id}**
- Bulk delete products
- Validates products not used in orders
- Returns deleted count and any conflicts

#### Example Request:
```typescript
// Bulk Update
await fetch("/api/admin/products/bulk", {
  method: "POST",
  body: JSON.stringify({
    productIds: ["id1", "id2", "id3"],
    updates: {
      price: 29.99,
      isPublished: true
    }
  })
})

// Bulk Delete
await fetch("/api/admin/products/bulk?id=id1&id=id2", {
  method: "DELETE"
})
```

### 2. Bulk Order Operations

**POST /api/admin/orders/bulk**
- Update order status for multiple orders
- Statuses: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- Updates timestamp automatically

**DELETE /api/admin/orders/bulk?id={id}**
- Delete multiple orders
- Only allows PENDING or CANCELLED orders
- Cascades to related records (items, payments, tracking)

#### Example Request:
```typescript
await fetch("/api/admin/orders/bulk", {
  method: "POST",
  body: JSON.stringify({
    orderIds: ["order1", "order2"],
    status: "SHIPPED"
  })
})
```

### 3. CSV Product Import

**POST /api/admin/products/import**
- Import products from CSV file
- Supports create and upsert modes
- Validates each row individually
- Returns detailed success/failure report

#### CSV Template Format:
```csv
name,description,price,stock,category,type,material,color,size,sku,isPublished
Classic Cotton T-Shirt,Comfortable cotton t-shirt,29.99,100,Topwear,T-Shirt,Cotton,Blue,M,TSH-001,true
```

#### Required Fields:
- name (string)
- price (number)
- stock (number)
- category (string)
- type (string)

#### Optional Fields:
- description, material, color, size, sku, isPublished

### 4. UI Components

#### BulkActions Component
Location: `components/bulk-actions.tsx`

Features:
- Selection counter
- Clear selection button
- Actions dropdown (Update/Delete)
- Delete confirmation dialog
- Loading states

Usage:
```tsx
<BulkActions
  selectedIds={selectedIds}
  onClearSelection={() => setSelectedIds([])}
  onUpdate={handleBulkUpdate}
  onDelete={handleBulkDelete}
  type="products"
/>
```

#### BulkUpdateDialog Component
Location: `components/bulk-update-dialog.tsx`

Features:
- Dynamic fields based on type (products/orders)
- Product fields: price, stock, category, visibility
- Order field: status
- Validation and error handling
- Progress indicators

Usage:
```tsx
<BulkUpdateDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  selectedIds={selectedIds}
  type="products"
  onSuccess={handleSuccess}
/>
```

#### CsvImport Component
Location: `components/csv-import.tsx`

Features:
- File upload dialog
- CSV template download
- CSV parsing and validation
- Upload progress
- Detailed import results

Usage:
```tsx
<CsvImport onImportComplete={() => router.refresh()} />
```

## Integration Steps

### 1. Add to Products Page

```tsx
// app/admin/products/page.tsx
import { BulkActions } from "@/components/bulk-actions"
import { BulkUpdateDialog } from "@/components/bulk-update-dialog"
import { CsvImport } from "@/components/csv-import"

export default function ProductsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1>Products</h1>
        <div className="flex gap-2">
          <CsvImport onImportComplete={() => router.refresh()} />
          <Button>Add Product</Button>
        </div>
      </div>

      <BulkActions
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onUpdate={() => setShowUpdateDialog(true)}
        onDelete={handleBulkDelete}
        type="products"
      />

      {/* Product table with checkboxes */}

      <BulkUpdateDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        selectedIds={selectedIds}
        type="products"
        onSuccess={() => {
          setSelectedIds([])
          router.refresh()
        }}
      />
    </>
  )
}
```

### 2. Add Selection to Tables

```tsx
// Add checkbox column to table
<TableHead className="w-12">
  <Checkbox
    checked={selectedIds.length === products.length}
    onCheckedChange={(checked) => {
      if (checked) {
        setSelectedIds(products.map(p => p.id))
      } else {
        setSelectedIds([])
      }
    }}
  />
</TableHead>

// In table row
<TableCell>
  <Checkbox
    checked={selectedIds.includes(product.id)}
    onCheckedChange={(checked) => {
      if (checked) {
        setSelectedIds([...selectedIds, product.id])
      } else {
        setSelectedIds(selectedIds.filter(id => id !== product.id))
      }
    }}
  />
</TableCell>
```

## Validation Rules

### Product Updates
- Price: Must be positive number
- Stock: Must be non-negative integer
- Category: Must be valid category string
- At least one field must be provided

### Order Updates
- Status: Must be valid OrderStatus enum value
- Only admins can perform bulk operations

### CSV Import
- CSV file must have valid headers
- Required fields must be present
- Price and stock must be numeric
- Duplicate SKUs handled based on mode (create/upsert)

## Error Handling

### API Responses

Success:
```json
{
  "success": true,
  "updatedCount": 5,
  "message": "Successfully updated 5 product(s)"
}
```

Validation Error:
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["updates"],
      "message": "At least one update field is required"
    }
  ]
}
```

Delete Conflict:
```json
{
  "error": "Some products are used in orders and cannot be deleted",
  "usedProducts": ["id1", "id2"],
  "orderCount": 3
}
```

## Security Considerations

1. **Authentication**: All bulk endpoints require admin authentication
2. **Validation**: Zod schemas validate all input data
3. **Constraints**: 
   - Products in orders cannot be deleted
   - Only PENDING/CANCELLED orders can be deleted
4. **Transactions**: Order deletions use Prisma transactions for data integrity

## Performance Optimization

1. **Batch Operations**: Use `updateMany` and `deleteMany` for efficiency
2. **Pagination**: Limit selection size in UI (e.g., max 100 items)
3. **Progress Indicators**: Show loading states during operations
4. **Error Recovery**: Individual row failures in CSV import don't stop entire operation

## Testing

### Test Scenarios

1. **Bulk Update**
   - Update 5 products with new price
   - Update 10 products to unpublished
   - Update with invalid data (should fail validation)

2. **Bulk Delete**
   - Delete 3 products not in orders (should succeed)
   - Delete products used in orders (should fail with details)
   - Delete PENDING orders (should succeed)
   - Delete DELIVERED orders (should fail)

3. **CSV Import**
   - Import 10 valid products (all should succeed)
   - Import with some invalid rows (show partial success)
   - Import with duplicate SKUs in upsert mode
   - Download and verify template format

## Future Enhancements

1. **Batch Processing**: For very large imports (1000+), process in chunks
2. **Background Jobs**: Use queue for long-running operations
3. **Export**: Export products to CSV for editing and re-import
4. **Undo**: Store operation history for rollback capability
5. **Scheduling**: Schedule bulk updates for specific times
6. **Templates**: Save bulk update templates for reuse

## Next Steps

After implementing bulk operations:
- **Step 20**: Export Functionality (PDF invoices, Excel reports)
- **Step 21**: Settings & Configuration
- **Step 22**: Documentation & Help System
