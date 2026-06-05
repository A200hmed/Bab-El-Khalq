import { useNavigate } from "react-router";
import { Coffee, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <Coffee className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          الصفحة التي تبحث عنها غير موجودة
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
        >
          <Home className="w-5 h-5" />
          العودة إلى الصفحة الرئيسية
        </button>
      </div>
    </div>
  );
}
