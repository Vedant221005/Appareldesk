if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  throw new Error("Cashfree credentials are not configured")
}

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY
const CASHFREE_ENV = process.env.NODE_ENV === "production" ? "production" : "sandbox"
const CASHFREE_API_VERSION = "2023-08-01"

// Base URL for Cashfree API
const getBaseUrl = () => {
  return CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg"
}

// Helper function to make Cashfree API calls
async function cashfreeRequest(endpoint: string, method: string = "GET", body?: any) {
  const url = `${getBaseUrl()}${endpoint}`
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": CASHFREE_APP_ID!,
    "x-client-secret": CASHFREE_SECRET_KEY!,
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Cashfree API Error: ${response.status} - ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Create a Cashfree order
 */
export async function createCashfreeOrder(
  orderId: string,
  amount: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string = "9999999999",
  customerId?: string
) {
  try {
    // Generate alphanumeric customer ID (Cashfree requirement)
    const sanitizedCustomerId = customerId 
      ? customerId.replace(/[^a-zA-Z0-9_-]/g, '_')
      : `CUST_${Date.now()}`
    
    // Ensure phone is exactly 10 digits
    const sanitizedPhone = customerPhone.replace(/\D/g, '').slice(-10) || "9999999999"
    
    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: sanitizedCustomerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: sanitizedPhone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders`,
      },
    }

    console.log("Creating Cashfree order with:", JSON.stringify(request, null, 2))
    
    const response = await cashfreeRequest("/orders", "POST", request)
    
    console.log("Cashfree order created:", response)
    
    return response
  } catch (error) {
    console.error("Error creating Cashfree order:", error)
    throw error
  }
}

/**
 * Verify Cashfree payment
 */
export async function verifyCashfreePayment(orderId: string) {
  try {
    return await cashfreeRequest(`/orders/${orderId}/payments`, "GET")
  } catch (error) {
    console.error("Error verifying Cashfree payment:", error)
    throw error
  }
}

/**
 * Get order details from Cashfree
 */
export async function getCashfreeOrderDetails(orderId: string) {
  try {
    return await cashfreeRequest(`/orders/${orderId}`, "GET")
  } catch (error) {
    console.error("Error fetching order details:", error)
    throw error
  }
}

/**
 * Create a refund
 */
export async function createCashfreeRefund(
  orderId: string,
  refundId: string,
  refundAmount: number,
  refundNote?: string
) {
  try {
    const request = {
      refund_amount: refundAmount,
      refund_id: refundId,
      refund_note: refundNote || "Refund processed",
    }

    return await cashfreeRequest(`/orders/${orderId}/refunds`, "POST", request)
  } catch (error) {
    console.error("Error creating refund:", error)
    throw error
  }
}
