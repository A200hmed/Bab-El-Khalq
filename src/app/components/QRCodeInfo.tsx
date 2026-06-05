import { QrCode } from "lucide-react";

export function QRCodeInfo() {
  const currentUrl = window.location.origin;
  
  return (
    <div className="bg-accent/20 border border-accent rounded-xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="bg-accent/30 p-3 rounded-lg">
          <QrCode className="w-8 h-8 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-accent-foreground mb-2">
            رمز QR للمنيو الرقمي
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            يمكنك إنشاء رمز QR للرابط التالي وطباعته على الطاولات:
          </p>
          <div className="bg-card px-4 py-3 rounded-lg border border-border font-mono text-sm break-all">
            {currentUrl}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 استخدم أي موقع لإنشاء رمز QR مثل qr-code-generator.com
          </p>
        </div>
      </div>
    </div>
  );
}
