import nodemailer from "nodemailer"

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Email credentials not configured. Skipping email send.")
      return { success: false, error: "Email not configured" }
    }

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "ApparelDesk"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Email Templates

export function getOrderConfirmationEmail(order: any) {
  const itemsHtml = order.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.product.name}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₹${item.unitPrice.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
        ₹${item.total.toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #6366f1; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 20px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${order.customer.name},
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
            Thank you for your order! We've received your order and will notify you when it ships.
          </p>
          
          <!-- Order Details -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #111827; margin-top: 0;">Order Details</h2>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Order Number:</strong> ${order.orderNumber}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Status:</strong> <span style="color: #059669; font-weight: 600;">${order.status}</span>
            </p>
          </div>
          
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Product</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <!-- Order Summary -->
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
            <table style="width: 100%; margin-bottom: 10px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; color: #374151;">₹${order.subtotal.toFixed(2)}</td>
              </tr>
              ${
                order.discount > 0
                  ? `
              <tr>
                <td style="padding: 8px 0; color: #059669;">Discount:</td>
                <td style="padding: 8px 0; text-align: right; color: #059669;">-₹${order.discount.toFixed(2)}</td>
              </tr>
              `
                  : ""
              }
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Tax:</td>
                <td style="padding: 8px 0; text-align: right; color: #374151;">₹${order.tax.toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0; font-size: 18px; font-weight: 600; color: #111827;">Total:</td>
                <td style="padding: 12px 0; font-size: 18px; font-weight: 600; text-align: right; color: #6366f1;">₹${order.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${order.id}" 
               style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Order Details
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 40px;">
            If you have any questions, please contact us at ${process.env.SMTP_USER}
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © ${new Date().getFullYear()} ApparelDesk. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getShippingUpdateEmail(order: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #8b5cf6; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Your Order is on the Way!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 20px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${order.customer.name},
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
            Great news! Your order has been shipped and is on its way to you.
          </p>
          
          <!-- Tracking Info -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #111827; margin-top: 0;">Tracking Information</h2>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Order Number:</strong> ${order.orderNumber}
            </p>
            ${
              order.trackingNumber
                ? `
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Tracking Number:</strong> <span style="font-family: monospace; background-color: #fff; padding: 4px 8px; border-radius: 4px;">${order.trackingNumber}</span>
            </p>
            `
                : ""
            }
            ${
              order.carrier
                ? `
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Carrier:</strong> ${order.carrier}
            </p>
            `
                : ""
            }
            ${
              order.estimatedDelivery
                ? `
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}
            </p>
            `
                : ""
            }
            <p style="margin: 15px 0 5px 0; color: #6b7280;">
              <strong>Status:</strong> <span style="color: #8b5cf6; font-weight: 600;">${order.status}</span>
            </p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${order.id}/tracking" 
               style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Track Your Order
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 40px;">
            Questions about your order? Contact us at ${process.env.SMTP_USER}
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © ${new Date().getFullYear()} ApparelDesk. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getPaymentReceiptEmail(order: any, payment: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #059669; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Payment Received</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 20px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${order.customer.name},
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
            Thank you for your payment! This email confirms that we've received your payment.
          </p>
          
          <!-- Payment Details -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #111827; margin-top: 0;">Payment Details</h2>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Order Number:</strong> ${order.orderNumber}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Payment Method:</strong> ${payment.paymentMethod}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Transaction ID:</strong> <span style="font-family: monospace; background-color: #fff; padding: 4px 8px; border-radius: 4px;">${payment.transactionId}</span>
            </p>
            <p style="margin: 15px 0 5px 0; color: #6b7280;">
              <strong>Amount Paid:</strong> <span style="color: #059669; font-size: 24px; font-weight: 600;">₹${payment.amount.toFixed(2)}</span>
            </p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${order.id}" 
               style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Order
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 40px;">
            Need help? Contact us at ${process.env.SMTP_USER}
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © ${new Date().getFullYear()} ApparelDesk. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
