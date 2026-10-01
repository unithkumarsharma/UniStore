import crypto from 'node:crypto';

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

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    'vH7wUf3XnIPsX6hAvRSsKnVh';

  if (!keySecret) {
    return res.status(500).json({ error: 'Razorpay key secret not configured on server.' });
  }

  const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const razorpayOrderId = data.razorpay_order_id || data.order_id;
  const razorpayPaymentId = data.razorpay_payment_id || data.payment_id;
  const razorpaySignature = data.razorpay_signature || data.signature;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({
      error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required',
    });
  }

  try {
    const message = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(message)
      .digest('hex');

    // Secure timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuffer = Buffer.from(razorpaySignature, 'utf-8');

    let isValid = false;
    if (expectedBuffer.length === signatureBuffer.length) {
      isValid = crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment verification failed: Invalid cryptographic signature',
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment signature verified successfully',
      order_id: razorpayOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      order_status: 'CONFIRMED',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: `Verification error: ${err.message || 'Signature calculation failed'}`,
    });
  }
}
