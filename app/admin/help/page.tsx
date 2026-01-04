"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Book, 
  Search, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  FileText, 
  Settings, 
  Download,
  Upload,
  Mail,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function AdminHelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const gettingStarted = [
    {
      id: "login",
      title: "Logging In",
      icon: Users,
      content: "Access the admin panel at /admin. Use your admin credentials to log in. If you're a new admin, contact the system administrator for account creation."
    },
    {
      id: "dashboard",
      title: "Understanding the Dashboard",
      icon: FileText,
      content: "The dashboard provides an overview of your store's performance including total sales, orders, products, and customers. Use the date filter to view statistics for specific periods."
    },
    {
      id: "navigation",
      title: "Navigating the Admin Panel",
      icon: Book,
      content: "Use the sidebar menu to access different sections: Products, Orders, Customers, Coupons, Reports, and Settings. Each section has its own set of features and tools."
    }
  ]

  const productManagement = [
    {
      id: "add-product",
      title: "Adding New Products",
      icon: Package,
      content: "Navigate to Products → Add Product. Fill in the required fields: name, description, category, price, and stock. Upload product images (up to 5). Click 'Create Product' to publish or save as draft."
    },
    {
      id: "edit-product",
      title: "Editing Products",
      icon: Package,
      content: "Go to Products page, click the Edit icon on any product. Update the fields you want to change. Click 'Update Product' to save changes. You can also toggle product visibility (published/unpublished)."
    },
    {
      id: "bulk-products",
      title: "Bulk Product Operations",
      icon: Upload,
      content: "Select multiple products using checkboxes. Use the bulk actions menu to update prices, stock levels, categories, or delete multiple products at once. Import products via CSV using the Import button."
    },
    {
      id: "product-export",
      title: "Exporting Products",
      icon: Download,
      content: "Click the Excel Export or CSV Export button on the Products page. Choose filters if needed. The file will download with all product data including name, price, stock, category, and dates."
    }
  ]

  const orderManagement = [
    {
      id: "view-orders",
      title: "Viewing Orders",
      icon: ShoppingCart,
      content: "Navigate to Orders to see all customer orders. Use filters to find specific orders by status, date range, or payment status. Click on any order to view full details."
    },
    {
      id: "update-status",
      title: "Updating Order Status",
      icon: ShoppingCart,
      content: "Open an order details page. Use the status dropdown to change order status (Confirmed, Processing, Shipped, Delivered, etc.). Add tracking information for shipped orders. Customers receive email notifications automatically."
    },
    {
      id: "bulk-orders",
      title: "Bulk Order Operations",
      icon: ShoppingCart,
      content: "Select multiple orders using checkboxes. Use bulk actions to update statuses or delete orders. Note: Only DRAFT or CANCELLED orders can be deleted."
    },
    {
      id: "invoices",
      title: "Generating Invoices",
      icon: FileText,
      content: "Open any order details page. Click 'Download Invoice' to generate a PDF invoice. The invoice includes company details, customer info, order items, and totals with tax and shipping."
    }
  ]

  const customerManagement = [
    {
      id: "view-customers",
      title: "Managing Customers",
      icon: Users,
      content: "Go to Customers to view all registered users. See customer details including name, email, phone, and order history. Search for customers by name or email."
    },
    {
      id: "customer-orders",
      title: "Viewing Customer Orders",
      icon: ShoppingCart,
      content: "Click on any customer to view their complete order history. See total spending, number of orders, and detailed order information."
    }
  ]

  const couponManagement = [
    {
      id: "create-coupon",
      title: "Creating Coupons",
      icon: Tag,
      content: "Navigate to Coupons → Add Coupon. Enter coupon code (uppercase). Set discount type (percentage or fixed amount). Define minimum order amount, usage limits, and validity dates. Link to a discount offer."
    },
    {
      id: "manage-coupons",
      title: "Managing Coupons",
      icon: Tag,
      content: "View all coupons with their status, usage count, and validity. Toggle coupon active/inactive status. Edit coupon details or delete unused coupons. Monitor usage statistics."
    }
  ]

  const reportsAndAnalytics = [
    {
      id: "sales-reports",
      title: "Sales Reports",
      icon: FileText,
      content: "Go to Reports → Sales to view revenue analytics. Filter by date range and period (day, week, month, year). See total revenue, order count, average order value, and payment status breakdown."
    },
    {
      id: "product-reports",
      title: "Product Performance",
      icon: Package,
      content: "Navigate to Reports → Products to see top-selling products. View sales quantity, revenue generated, and stock levels. Use this data to optimize inventory and marketing."
    },
    {
      id: "export-reports",
      title: "Exporting Data",
      icon: Download,
      content: "Use Excel or CSV export buttons on Orders and Products pages. Apply filters before exporting to get specific data sets. Reports include all relevant fields for analysis."
    }
  ]

  const systemSettings = [
    {
      id: "company-info",
      title: "Company Information",
      icon: Settings,
      content: "Go to Settings to configure company details. Enter company name, email, phone, address, and GST number. This information appears on invoices and customer communications."
    },
    {
      id: "pricing-tax",
      title: "Pricing & Tax Configuration",
      icon: Settings,
      content: "Set default tax rate (%), shipping fee, currency symbol, and invoice prefix. Tax is automatically calculated on all orders. Free shipping applies for orders above ₹1000."
    },
    {
      id: "email-settings",
      title: "Email Notifications",
      icon: Mail,
      content: "Configure SMTP settings for automated emails. Customers receive order confirmations, shipping updates, and delivery notifications automatically."
    }
  ]

  const faqData = [
    {
      id: "faq-1",
      question: "How do I change my admin password?",
      answer: "Currently, password changes require database access. Contact your system administrator to update your password securely."
    },
    {
      id: "faq-2",
      question: "Why can't I delete some orders?",
      answer: "Only orders with DRAFT or CANCELLED status can be deleted. This protects completed transactions and maintains order history integrity."
    },
    {
      id: "faq-3",
      question: "How does the free shipping threshold work?",
      answer: "Orders with subtotal (after discount) of ₹1000 or more automatically get free shipping. Orders below this amount are charged the default shipping fee set in Settings."
    },
    {
      id: "faq-4",
      question: "What's the CSV import format for products?",
      answer: "Download the CSV template from the Products page. Required fields: name, price, stock. Optional: description, category, type, material, isPublished. Each product on a new row."
    },
    {
      id: "faq-5",
      question: "How do tax calculations work?",
      answer: "Tax is calculated on the subtotal after discount. The tax rate is set in Settings (default 18%). Formula: (Subtotal - Discount) × Tax Rate / 100"
    },
    {
      id: "faq-6",
      question: "Can I customize invoice appearance?",
      answer: "Invoice design uses company information from Settings. Customize company name, address, contact details, and GST number to personalize invoices."
    },
    {
      id: "faq-7",
      question: "How do I track inventory levels?",
      answer: "Stock levels are updated automatically when orders are placed. View current stock on the Products page. Use bulk update to adjust stock levels for multiple products."
    },
    {
      id: "faq-8",
      question: "What payment methods are supported?",
      answer: "The system integrates with Cashfree for secure online payments. Customers can use credit/debit cards, UPI, net banking, and wallets."
    }
  ]

  const filterContent = (items: any[]) => {
    if (!searchQuery) return items
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.question && item.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.answer && item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  const renderSection = (items: any[], showIcon = true) => {
    const filtered = filterContent(items)
    if (filtered.length === 0 && searchQuery) {
      return <p className="text-gray-400 text-center py-8">No results found</p>
    }

    return (
      <div className="space-y-3">
        {filtered.map((item) => (
          <Card 
            key={item.id} 
            className={cn(
              "p-4 transition-all duration-200",
              expandedSections[item.id]
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "hover:shadow-md hover:border-primary/30"
            )}
          >
            <button
              onClick={() => toggleSection(item.id)}
              className="w-full flex items-start gap-3 text-left"
            >
              {showIcon && item.icon && (
                <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-white">{item.question || item.title}</h3>
                  {expandedSections[item.id] ? (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                {expandedSections[item.id] && (
                  <p className="text-gray-300 mt-2 leading-relaxed">
                    {item.answer || item.content}
                  </p>
                )}
              </div>
            </button>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Help & Documentation</h1>
        <p className="text-gray-400 mt-2">
          Complete guide to using the ApparelDesk admin panel
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Getting Started</h2>
            <p className="text-gray-400 mb-6">
              Welcome to ApparelDesk! Follow these guides to get familiar with the admin panel.
            </p>
            {renderSection(gettingStarted)}
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
              <Package className="h-6 w-6 text-primary" />
              Product Management
            </h2>
            <Separator className="my-4" />
            {renderSection(productManagement)}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Order Management
            </h2>
            <Separator className="my-4" />
            {renderSection(orderManagement)}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
              <Users className="h-6 w-6 text-primary" />
              Customer Management
            </h2>
            <Separator className="my-4" />
            {renderSection(customerManagement)}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
              <Tag className="h-6 w-6 text-primary" />
              Coupon Management
            </h2>
            <Separator className="my-4" />
            {renderSection(couponManagement)}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
              <FileText className="h-6 w-6 text-primary" />
              Reports & Analytics
            </h2>
            <Separator className="my-4" />
            {renderSection(reportsAndAnalytics)}
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">System Configuration</h2>
            <p className="text-gray-400 mb-6">
              Learn how to configure system settings for your store.
            </p>
            {renderSection(systemSettings)}
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-gray-400 mb-6">
              Common questions and answers about using ApparelDesk.
            </p>
            {renderSection(faqData, false)}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card className="p-6 bg-gray-900/30 border-primary/20">
        <h3 className="font-semibold text-lg mb-4 text-white">Need More Help?</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start" asChild>
            <a href="mailto:support@appareldesk.com">
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </a>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <a href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </a>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <a href="/admin/reports">
              <FileText className="mr-2 h-4 w-4" />
              View Reports
            </a>
          </Button>
        </div>
      </Card>
    </div>
  )
}
