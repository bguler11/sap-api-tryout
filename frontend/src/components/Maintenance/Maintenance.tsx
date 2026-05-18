export default function Maintenance() {
  return (
    <div className="min-h-screen bg-sap-darkgray flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <div className="w-16 h-16 bg-sap-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">SAP</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Bakım Modu</h1>
        <p className="text-gray-400 text-sm mb-2">
          Sistem şu anda bakımda. Kısa süre içinde geri döneceğiz.
        </p>
        <p className="text-gray-500 text-xs">
          SAP API Try-Out — Maintenance Mode
        </p>
      </div>
    </div>
  );
}
