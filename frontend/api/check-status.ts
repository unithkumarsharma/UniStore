export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.VITE_RAZORPAY_KEY_ID ||
    'rzp_live_ThtXF38AsiSzf9';
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    'vH7wUf3XnIPsX6hAvRSsKnVh';

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay API credentials not configured.' });
  }

  const queryOrBody = req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) : req.query || {};
  const razorpayOrderId = queryOrBody.razorpay_order_id || queryOrBody.order_id;

  if (!razorpayOrderId) {
    return res.status(400).json({ error: 'razorpay_order_id is required' });
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const rzpResponse = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}/payments`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await rzpResponse.json();
    if (!rzpResponse.ok) {
      return res.status(rzpResponse.status).json({ error: data?.error?.description || 'Failed to check status' });
    }

    const items = data.items || [];
    const captured = items.find((p: any) => p.status === 'captured');
    const authorized = items.find((p: any) => p.status === 'authorized');
    const payment = captured || authorized || items[0];

    return res.status(200).json({
      paid: !!captured,
      status: payment ? payment.status : 'created',
      payment_id: payment ? payment.id : null,
      amount: payment ? payment.amount : null,
      currency: payment ? payment.currency : 'INR',
      method: payment ? payment.method : null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Network error checking status: ${err.message}` });
  }
}
