# Advanced Search & Filters - Step 18

## Overview
Step 18 implements comprehensive search and filtering capabilities across the ApparelDesk application, making it easy to find products, orders, customers, and vendors.

## Features Implemented

### 1. Global Search (⌘K / Ctrl+K)
- **Location**: Available in admin header
- **Keyboard Shortcut**: Press `Ctrl+K` (Windows) or `Cmd+K` (Mac)
- **Search Across**:
  - Products (name, description, category, type)
  - Orders (order number)
  - Customers (name, email, phone)
- **Features**:
  - Real-time search with debouncing (300ms)
  - Instant results dropdown
  - Quick navigation to search results
  - Loading indicators
  - Clear search functionality

### 2. Advanced Product Filters
**API Endpoint**: `/api/products/filter`

**Available Filters**:
- **Multi-select Category**: Select multiple categories at once
- **Multi-select Type**: Filter by multiple product types
- **Multi-select Material**: Filter by materials
- **Price Range**: Min and max price slider
- **Stock Status**: 
  - In Stock (>10 units)
  - Low Stock (1-10 units)
  - Out of Stock (0 units)
- **Search**: Text search in name and description

**Sorting Options**:
- Price (Low to High)
- Price (High to Low)
- Name (A-Z)
- Newest First

**Pagination**: 12 products per page (configurable)

### 3. Advanced Order Filters
**API Endpoint**: `/api/admin/orders/filter`

**Available Filters**:
- **Order Status** (multi-select):
  - Draft, Confirmed, Processing, Shipped, Out for Delivery, Delivered, Cancelled, Completed
- **Payment Status**:
  - Paid
  - Pending
  - Failed
- **Date Range**: Start and end date picker
- **Amount Range**: Min and max order amount
- **Customer Search**: Search by customer name, email, or phone
- **Order Number**: Search by order number
- **Coupon Filter**: Orders with/without coupons applied

**Sorting Options**:
- Order Date (Newest/Oldest)
- Amount (High to Low / Low to High)
- Order Number (A-Z)

**Pagination**: 20 orders per page (configurable)

### 4. Filter UI Components

**Reusable Components Created**:
1. **FilterChips** (`components/filters/filter-chips.tsx`)
   - Display applied filters as removable chips
   - Clear all filters button
   - Clean, intuitive UI

2. **PriceRangeFilter** (`components/filters/price-range-filter.tsx`)
   - Dual slider for price range
   - Manual input fields
   - Real-time value display

3. **DateRangeFilter** (`components/filters/date-range-filter.tsx`)
   - Calendar picker for start/end dates
   - Human-readable date display
   - Easy date selection

### 5. Database Performance Optimizations

**New Indexes Added** (Migration: `20260103161720_add_search_indexes`):

**Product Table**:
- `name` - For text search
- `type` - For filtering by type
- `price` - For price range queries
- `stock` - For stock status filters

**SaleOrder Table**:
- `orderDate` - For date range queries
- `total` - For amount range filters
- `couponId` - For coupon filters

**Contact Table**:
- `name` - For customer search
- `phone` - For phone number search
- `city` - For location filters

These indexes significantly improve query performance, especially as the database grows.

## Usage Examples

### Global Search
```tsx
import { GlobalSearch } from "@/components/global-search"

// In your layout or header
<GlobalSearch />
```

### Product Filters API
```typescript
// GET /api/products/filter?category=T-Shirts&category=Jeans&minPrice=500&maxPrice=2000&stockStatus=in-stock&sortBy=price-asc&page=1&limit=12

const response = await fetch('/api/products/filter?' + new URLSearchParams({
  category: ['T-Shirts', 'Jeans'],
  minPrice: '500',
  maxPrice: '2000',
  stockStatus: 'in-stock',
  sortBy: 'price-asc',
  page: '1',
  limit: '12'
}))

const data = await response.json()
// Returns: { products, pagination, filters }
```

### Order Filters API
```typescript
// GET /api/admin/orders/filter?status=SHIPPED&status=DELIVERED&startDate=2026-01-01&endDate=2026-01-31&minAmount=1000&paymentStatus=paid

const response = await fetch('/api/admin/orders/filter?' + new URLSearchParams({
  status: ['SHIPPED', 'DELIVERED'],
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  minAmount: '1000',
  paymentStatus: 'paid',
  page: '1'
}))

const data = await response.json()
// Returns: { orders, pagination }
```

### Using Filter Components
```tsx
import { FilterChips } from "@/components/filters/filter-chips"
import { PriceRangeFilter } from "@/components/filters/price-range-filter"
import { DateRangeFilter } from "@/components/filters/date-range-filter"

// Filter Chips
<FilterChips
  filters={[
    { label: "Category: T-Shirts", value: "tshirts", onRemove: () => {} },
    { label: "Price: ₹500-₹2000", value: "price", onRemove: () => {} }
  ]}
  onClearAll={() => {}}
/>

// Price Range Filter
<PriceRangeFilter
  min={0}
  max={10000}
  value={[500, 2000]}
  onChange={(range) => {}}
/>

// Date Range Filter
<DateRangeFilter
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
/>
```

## Performance Considerations

1. **Debouncing**: Search queries are debounced by 300ms to reduce API calls
2. **Pagination**: All list endpoints support pagination to handle large datasets
3. **Database Indexes**: Strategic indexes on frequently queried columns
4. **Query Optimization**: Efficient Prisma queries with proper includes and selects

## Future Enhancements

- Save filter presets (favorite filters)
- Export filtered results to CSV/Excel
- Advanced search operators (AND, OR, NOT)
- Recent searches history
- Search suggestions based on popular queries
- Full-text search using PostgreSQL's full-text capabilities

## API Reference

### Search API
```
GET /api/search?q={query}&type={all|products|orders|customers}
```

### Product Filter API
```
GET /api/products/filter
Query Parameters:
  - category[] (array)
  - type[] (array)
  - material[] (array)
  - minPrice (number)
  - maxPrice (number)
  - stockStatus (in-stock|low-stock|out-of-stock)
  - search (string)
  - sortBy (price-asc|price-desc|name|createdAt)
  - page (number)
  - limit (number)
```

### Order Filter API
```
GET /api/admin/orders/filter
Query Parameters:
  - status[] (array)
  - paymentStatus (paid|pending|failed)
  - startDate (ISO date)
  - endDate (ISO date)
  - minAmount (number)
  - maxAmount (number)
  - customer (string)
  - orderNumber (string)
  - hasCoupon (true|false)
  - sortBy (orderDate|total|orderNumber)
  - sortOrder (asc|desc)
  - page (number)
  - limit (number)
```

## Notes

- All search and filter APIs require authentication
- Admin-only endpoints check for ADMIN role
- Filters are combined with AND logic (all conditions must match)
- Multi-select filters use OR logic within the same filter (e.g., category=T-Shirts OR Jeans)
