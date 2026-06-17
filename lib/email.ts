export async function sendOrderEmail(
  type: 'paid' | 'shipped' | 'cancelled' | 'refunded',
  order: {
    id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    shipping_method_name?: string;
    address?: string;
    phone?: string;
    items: { quantity: number; productName?: string; name?: string; skuName?: string; price: number }[];
  }
) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@bthplus.store';

  if (!apiKey) {
    console.error('BREVO_API_KEY is not set');
    return { success: false, error: 'Missing API key' };
  }

  const shortId = order.id?.slice(0, 8);

  const subjects: Record<typeof type, string> = {
    paid:      `Order Confirmed - #${shortId}`,
    shipped:   `Your BTH order is on the way!`,
    cancelled: `Update regarding your Order #${shortId}`,
    refunded:  `Your Refund for Order #${shortId} has been processed`,
  };

  const bodyContent: Record<typeof type, string> = {
    paid: `
      <p>Your order is confirmed! We've received your payment of <strong>₦${Number(order.total_amount).toLocaleString()}</strong>.</p>
      <p>Expect delivery within the timeframe specified by your shipping method.</p>
    `,
    shipped: `
      <p>Good news! Your order has been shipped and is on its way to you.</p>
      <p>Our courier will contact you when they are close.</p>
    `,
    cancelled: `
      <p>Your order has been cancelled. If payment was made, a refund might be initiated and will reflect in your account according to your bank's policy.</p>
    `,
    refunded: `
      <p>Your refund for order <strong>#${shortId}</strong> has been processed.</p>
      <p>The amount of <strong>₦${Number(order.total_amount).toLocaleString()}</strong> will reflect in your account within <strong>3–5 business days</strong>, depending on your bank's policy.</p>
      <p>We're sorry things didn't work out — we hope to serve you again.</p>
    `,
  };

  const deliveryBlock = (order.address || order.phone || order.shipping_method_name) ? `
    <div style="margin-top: 24px; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <h3 style="text-transform: uppercase; font-size: 10px; color: #888; margin: 0 0 12px;">Delivery Details</h3>

      ${order.shipping_method_name ? `
        <p style="font-size: 13px; margin: 4px 0 8px;">
          <span style="color: #888; text-transform: uppercase; font-size: 10px;">Shipping Method</span><br/>
          <strong>${order.shipping_method_name}</strong>
        </p>` : ''}

      ${order.address ? `
        <p style="font-size: 13px; margin: 8px 0;">
          <span style="color: #888; text-transform: uppercase; font-size: 10px;">Delivery Address</span><br/>
          ${order.address}
        </p>` : ''}

      ${order.phone ? `
        <p style="font-size: 13px; margin: 8px 0 0;">
          <span style="color: #888; text-transform: uppercase; font-size: 10px;">Phone</span><br/>
          ${order.phone}
        </p>` : ''}
    </div>
  ` : '';

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 2px solid #000;">
      <h1 style="text-transform: uppercase; font-style: italic; font-weight: 900; letter-spacing: -2px; font-size: 40px; margin: 0;">BTH+</h1>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="text-transform: uppercase; font-size: 12px; font-weight: bold;">Hi ${order.customer_name},</p>

      ${bodyContent[type]}

      ${deliveryBlock}

      <div style="margin-top: 24px; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h3 style="text-transform: uppercase; font-size: 10px; color: #888; margin: 0 0 12px;">Order Summary</h3>
        ${order.items.map((item) => {
          const label = item.productName || item.name || 'Item';
          const subtotal = (item.price * item.quantity).toLocaleString();
          return `
            <p style="font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 6px 0;">
              ${item.quantity}x ${label}${item.skuName ? ` (${item.skuName})` : ''} — ₦${subtotal}
            </p>
          `;
        }).join('')}
        <p style="border-top: 1px solid #ddd; margin-top: 12px; padding-top: 12px; font-weight: 900; font-size: 14px;">
          Total: ₦${Number(order.total_amount).toLocaleString()}
        </p>
      </div>

      <p style="font-size: 9px; color: #aaa; margin-top: 40px; text-transform: uppercase; letter-spacing: 2px;">
        © 2026 BTH+ ESSENTIALS
      </p>
    </div>
  `;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'BTH STORE', email: senderEmail },
        to: [{ email: order.customer_email, name: order.customer_name }],
        subject: subjects[type],
        htmlContent,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      console.error('Brevo API error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Brevo Email Error:', error);
    return { success: false, error };
  }
}