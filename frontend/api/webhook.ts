import crypto from 'node:crypto';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Razorpay-Signature'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    'vH7wUf3XnIPsX6hAvRSsKnVh';

  const signature = (req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature']) as string | undefined;

  let rawBody: string = '';
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    rawBody = req.body.toString('utf8');
  } else if (req.body) {
    rawBody = JSON.stringify(req.body);
  }

  // If webhook secret & signature are present, verify HMAC
  if (webhookSecret && signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
      const signatureBuffer = Buffer.from(signature, 'utf-8');

      let isValid = false;
      if (expectedBuffer.length === signatureBuffer.length) {
        isValid = crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
      }

      if (!isValid) {
        console.warn('[Razorpay Webhook] Signature verification failed');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    } catch (e: any) {
      console.error('[Razorpay Webhook] Error checking signature:', e);
      return res.status(400).json({ error: 'Webhook signature validation error' });
    }
  }

  const payload = typeof req.body === 'string' ? JSON.parse(rawBody || '{}') : req.body || {};
  const event = payload.event;

  console.log(`[Razorpay Webhook] Received event: ${event}`);

  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentEntity = payload.payload?.payment?.entity || {};
    const orderEntity = payload.payload?.order?.entity || {};

    const razorpayOrderId = paymentEntity.order_id || orderEntity.id;
    const razorpayPaymentId = paymentEntity.id;
    const amount = paymentEntity.amount ? paymentEntity.amount / 100 : undefined;

    console.log('[Razorpay Webhook] Payment confirmed for order:', {
      razorpayOrderId,
      razorpayPaymentId,
      amount,
      event,
    });
  }

  return res.status(200).json({
    status: 'ok',
    received: true,
    event: event || 'unknown',
  });
}
