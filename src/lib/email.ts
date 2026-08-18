/**
 * Email service — Resend
 * Free tier: 3,000 emails/month
 */
import { Resend } from 'resend';

const FROM = 'RwandaBuy <noreply@rwandabuy.rw>';

// Lazy factory — only instantiated when an email is actually sent.
// This prevents build failures when RESEND_API_KEY is not yet set.
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set. Add it to Vercel environment variables.');
  return new Resend(key);
}


// ── Order Confirmation (→ Buyer) ──────────────────────────────────────────────
export async function sendOrderConfirmation(opts: {
  buyerEmail: string;
  buyerName: string;
  orderId: string;
  items: { title: string; qty: number; price: number }[];
  total: number;
}) {
  const itemRows = opts.items.map(i =>
    `<tr><td style="padding:6px 0">${i.title}</td><td style="padding:6px 0;text-align:right">×${i.qty}</td><td style="padding:6px 0;text-align:right">RWF ${(i.price * i.qty).toLocaleString()}</td></tr>`
  ).join('');

  await getResend().emails.send({
    from: FROM,
    to: opts.buyerEmail,
    subject: `Order Confirmed — #${opts.orderId} | RwandaBuy`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#111;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Rwanda<span style="color:#22c55e">Buy</span></h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          <h2 style="margin-top:0">Order Confirmed ✅</h2>
          <p>Hi ${opts.buyerName}, your order <strong>#${opts.orderId}</strong> has been placed successfully.</p>
          <table style="width:100%;border-top:1px solid #e5e7eb;margin:20px 0">
            ${itemRows}
            <tr style="border-top:2px solid #111">
              <td colspan="2" style="padding:10px 0;font-weight:700">Total</td>
              <td style="padding:10px 0;text-align:right;font-weight:700">RWF ${opts.total.toLocaleString()}</td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:13px">Your seller will prepare your order shortly. You can track it in your <a href="https://rwandabuy.vercel.app/buyer/orders" style="color:#22c55e">orders page</a>.</p>
        </div>
      </div>`,
  });
}

// ── New Order Alert (→ Seller) ─────────────────────────────────────────────────
export async function sendNewOrderAlert(opts: {
  sellerEmail: string;
  sellerName: string;
  orderId: string;
  buyerName: string;
  items: { title: string; qty: number }[];
}) {
  const itemList = opts.items.map(i => `<li>${i.title} ×${i.qty}</li>`).join('');

  await getResend().emails.send({
    from: FROM,
    to: opts.sellerEmail,
    subject: `New Order #${opts.orderId} — RwandaBuy`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#111;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Rwanda<span style="color:#22c55e">Buy</span></h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          <h2 style="margin-top:0">🛒 New Order Received</h2>
          <p>Hi ${opts.sellerName}, <strong>${opts.buyerName}</strong> placed order <strong>#${opts.orderId}</strong>.</p>
          <ul>${itemList}</ul>
          <a href="https://rwandabuy.vercel.app/seller/dashboard" style="display:inline-block;background:#22c55e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">View Dashboard</a>
        </div>
      </div>`,
  });
}

// ── Seller Approved (→ Seller) ────────────────────────────────────────────────
export async function sendSellerApproved(opts: {
  sellerEmail: string;
  sellerName: string;
  shopName: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: opts.sellerEmail,
    subject: `Your RwandaBuy Seller Account is Approved! 🎉`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#111;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Rwanda<span style="color:#22c55e">Buy</span></h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          <h2 style="margin-top:0">Welcome to RwandaBuy, ${opts.sellerName}! 🎉</h2>
          <p>Your seller account <strong>${opts.shopName}</strong> has been approved. You can now list products and start selling.</p>
          <a href="https://rwandabuy.vercel.app/seller/dashboard" style="display:inline-block;background:#22c55e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Go to Dashboard</a>
        </div>
      </div>`,
  });
}

// ── Seller Rejected (→ Seller) ────────────────────────────────────────────────
export async function sendSellerRejected(opts: {
  sellerEmail: string;
  sellerName: string;
  reason: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: opts.sellerEmail,
    subject: `RwandaBuy Seller Application Update`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#111;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Rwanda<span style="color:#22c55e">Buy</span></h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          <h2 style="margin-top:0">Application Update</h2>
          <p>Hi ${opts.sellerName}, unfortunately your seller application was not approved at this time.</p>
          <p><strong>Reason:</strong> ${opts.reason}</p>
          <p>You may re-apply after addressing the above. Contact <a href="mailto:support@rwandabuy.rw">support@rwandabuy.rw</a> with questions.</p>
        </div>
      </div>`,
  });
}
