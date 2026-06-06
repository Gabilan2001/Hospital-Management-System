const QRCodeDisplay = ({ qrCode, patientId, size = 200 }) => {
  if (!qrCode) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ width: size, height: size }}>
        <p className="text-gray-400 text-sm">No QR Code</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <img src={qrCode} alt={`QR Code for ${patientId}`} style={{ width: size, height: size }} className="mx-auto rounded-lg" />
      {patientId && <p className="text-sm text-gray-600 mt-2 font-mono">{patientId}</p>}
    </div>
  );
};

export default QRCodeDisplay;
