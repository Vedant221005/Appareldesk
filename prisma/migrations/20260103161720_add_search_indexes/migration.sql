-- CreateIndex
CREATE INDEX "Contact_name_idx" ON "Contact"("name");

-- CreateIndex
CREATE INDEX "Contact_phone_idx" ON "Contact"("phone");

-- CreateIndex
CREATE INDEX "Contact_city_idx" ON "Contact"("city");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- CreateIndex
CREATE INDEX "Product_stock_idx" ON "Product"("stock");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "SaleOrder_orderDate_idx" ON "SaleOrder"("orderDate");

-- CreateIndex
CREATE INDEX "SaleOrder_total_idx" ON "SaleOrder"("total");

-- CreateIndex
CREATE INDEX "SaleOrder_couponId_idx" ON "SaleOrder"("couponId");
