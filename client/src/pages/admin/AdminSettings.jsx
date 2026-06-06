const AdminSettings = () => (
  <div className="max-w-2xl">
    <h1 className="text-2xl font-bold mb-6">Hospital Settings</h1>
    <div className="card space-y-4">
      <div>
        <h3 className="font-semibold">CareLink Hospital</h3>
        <p className="text-sm text-gray-500">Colombo, Sri Lanka</p>
      </div>
      <div className="border-t pt-4 space-y-2 text-sm">
        <p><span className="text-gray-500">System Version:</span> 1.0.0</p>
        <p><span className="text-gray-500">Timezone:</span> Asia/Colombo (UTC+5:30)</p>
        <p><span className="text-gray-500">Currency:</span> LKR (Sri Lankan Rupee)</p>
        <p><span className="text-gray-500">Date Format:</span> DD/MM/YYYY</p>
      </div>
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Integrations</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p>MongoDB Atlas - Connected</p>
          <p>Cloudinary - Configured</p>
          <p>PayHere - Sandbox Mode</p>
          <p>Twilio WhatsApp - Configure in server/.env</p>
          <p>Gmail SMTP - Configure in server/.env</p>
        </div>
      </div>
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Queue Display URL</h4>
        <code className="text-sm bg-gray-100 px-3 py-2 rounded block">http://localhost:5173/queue/display</code>
      </div>
    </div>
  </div>
);

export default AdminSettings;
