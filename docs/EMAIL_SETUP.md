# Email Notifications Setup

This application uses Nodemailer to send automated email notifications to customers for order-related events.

## Features

- **Order Confirmation**: Sent when a customer creates an order
- **Shipping Updates**: Sent when order status changes to SHIPPED, OUT_FOR_DELIVERY, or DELIVERED
- **Payment Receipts**: Sent when payment is successfully verified

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_NAME="ApparelDesk"
```

### Gmail Setup

If using Gmail, you need to:

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password and use it as `SMTP_PASS`

### Other SMTP Providers

For other email providers (like SendGrid, Mailgun, AWS SES), update the SMTP configuration accordingly:

**SendGrid:**
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

**AWS SES:**
```bash
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-ses-smtp-username"
SMTP_PASS="your-ses-smtp-password"
```

## Email Templates

Email templates are defined in `/lib/email.ts` with responsive HTML design:

- `getOrderConfirmationEmail(order)` - Order confirmation with items and totals
- `getShippingUpdateEmail(order)` - Shipping notification with tracking info
- `getPaymentReceiptEmail(order, payment)` - Payment receipt with transaction details

## Testing

### Development Mode

During development, if SMTP credentials are not configured, emails will be skipped gracefully without breaking the application flow. Check console logs for email send attempts.

### Production Testing

1. Configure SMTP credentials in `.env`
2. Create a test order
3. Verify email delivery
4. Update order status to SHIPPED
5. Complete a payment transaction

## Customization

### Email Templates

To customize email templates, edit the functions in `/lib/email.ts`:

```typescript
export function getOrderConfirmationEmail(order: any) {
  // Customize HTML template here
  return `...HTML content...`
}
```

### Email Trigger Points

Email sending is integrated at these API endpoints:

- **POST /api/orders** - Order confirmation
- **PATCH /api/admin/orders/[id]** - Shipping updates
- **POST /api/payments/cashfree/verify** - Payment receipts

## Troubleshooting

### Emails not sending

1. Check SMTP credentials are correct
2. Verify SMTP_HOST and SMTP_PORT match your provider
3. Check console logs for detailed error messages
4. For Gmail, ensure App Password is used (not regular password)

### Template rendering issues

1. Test HTML in an email client
2. Check that all order/payment data is available
3. Verify environment variable NEXT_PUBLIC_APP_URL is set for links

## Security Notes

- Never commit `.env` file with real credentials
- Use App Passwords instead of main account passwords
- Consider using dedicated email service for production (SendGrid, AWS SES)
- Rate limit email sending to prevent abuse
