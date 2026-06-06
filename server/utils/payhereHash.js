const crypto = require('crypto');

const generatePayHereHash = ({
  merchantId,
  orderId,
  amount,
  currency,
  merchantSecret,
}) => {
  const formattedAmount = parseFloat(amount).toFixed(2);
  const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase()}`;

  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

const verifyPayHereHash = (params, merchantSecret) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = params;

  const localHash = crypto
    .createHash('md5')
    .update(
      `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${crypto
        .createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase()}`
    )
    .digest('hex')
    .toUpperCase();

  return localHash === md5sig;
};

module.exports = { generatePayHereHash, verifyPayHereHash };
