export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.VITE_RAZORPAY_KEY_ID ||
    'rzp_live_ThtXF38AsiSzf9';
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    'vH7wUf3XnIPsX6hAvRSsKnVh';

  if (!keyId || !keySecret) {
    return res.status(500).json({
      error: 'Razorpay API credentials are not configured in environment variables.',
    });
  }

  const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  let amountVal = data.amount;
  if (amountVal === undefined && data.amount_in_paise !== undefined) {
    amountVal = data.amount_in_paise;
  } else if (amountVal === undefined && data.amount_inr !== undefined) {
    amountVal = Math.round(Number(data.amount_inr) * 100);
  }

  if (amountVal === undefined || isNaN(Number(amountVal))) {
    return res.status(400).json({ error: 'amount is required (in paise, minimum 100 paise)' });
  }

  const amountInPaise = Math.round(Number(amountVal));
  if (amountInPaise < 100) {
    return res.status(400).json({ error: 'Amount must be at least 100 paise (minimum ₹1.00)' });
  }

  const currency = data.currency || 'INR';
  const orderId = data.order_id || data.receipt;
  const receipt = data.receipt || orderId || `rcpt_${Date.now()}`;

  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: String(receipt).slice(0, 40),
        payment_capture: 1,
      }),
    });

    const rzpData = await rzpResponse.json();

    if (!rzpResponse.ok) {
      const errorMsg = rzpData?.error?.description || rzpData?.error?.reason || 'Failed to create order on Razorpay';
      return res.status(rzpResponse.status).json({ error: errorMsg });
    }

    return res.status(200).json({
      order_id: rzpData.id,
      razorpay_order_id: rzpData.id,
      id: rzpData.id,
      amount: rzpData.amount,
      currency: rzpData.currency,
      receipt: rzpData.receipt,
      key_id: keyId,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: `Razorpay connection error: ${err.message || 'Unknown network error'}`,
    });
  }
}
