const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  const qrCodeDataUrl = await QRCode.toDataURL(data, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 2,
    width: 300,
    color: {
      dark: '#1D4ED8',
      light: '#FFFFFF',
    },
  });
  return qrCodeDataUrl;
};

module.exports = generateQRCode;
