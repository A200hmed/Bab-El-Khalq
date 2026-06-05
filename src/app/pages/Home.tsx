import { useState, useEffect, useRef } from "react";
import { Settings, UtensilsCrossed, Sparkles, Star, Coffee } from "lucide-react";
import { useNavigate } from "react-router";
import { getProducts } from "../api";

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`
      }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    loadProducts();
  }, []);

  const categories = [
    { id: "قهوة ساخنة", name: "☕ مشروبات ساخنة", icon: <Coffee className="w-6 h-6" /> },
    { id: "شاي ومشروبات عشبية", name: "🍵 شاي ومشروبات عشبية", icon: <Sparkles className="w-6 h-6" /> },
    { id: "مشروبات باردة", name: "🧊 مشروبات باردة", icon: <Star className="w-6 h-6" /> },
    { id: "عصائر فريش", name: "🍹 عصائر فريش", icon: <Sparkles className="w-6 h-6" /> },
    { id: "مشروبات غازية ومياه", name: "🥤 مشروبات غازية ومياه", icon: <Star className="w-6 h-6" /> },
  ];

  const getProductsByCategory = (category: string) => {
    return products.filter((product) => product.category === category && product.available);
  };

  return (
    <div className="min-h-screen bg-[#12100E] text-[#FDF8F3] relative overflow-x-hidden" style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      {/* Elegant Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, rgba(212,175,55,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(212,175,55,0.05) 0%, transparent 50%)
          `
        }}></div>
        <div className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.03'%3E%3Cpath d='M50 50v-5h-2v5h-5v2h5v5h2v-5h5v-2h-5zm0-45V0h-2v5h-5v2h5v5h2V7h5V5h-5zM5 50v-5H3v5H0v2h3v5h2v-5h5v-2H5zM5 5V0H3v5H0v2h3v5h2V7h5V5H5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
             }}>
        </div>
      </div>

      {/* Admin Access Button */}
      <button
        onClick={() => navigate("/login")}
        className="fixed bottom-8 left-8 p-4 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/15 border border-[#D4AF37]/20 text-[#D4AF37] rounded-full shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-500 z-50 opacity-25 hover:opacity-100 hover:scale-110"
        title="لوحة التحكم"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Hero Section */}
      <AnimatedSection>
        <header className="relative py-28 md:py-36 px-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 via-transparent to-transparent"></div>

          <div className="relative z-10">
            <div className="mb-10 flex justify-center">
              <div className="p-6 bg-[#12100E] rounded-full border-2 border-[#D4AF37]/30 shadow-[0_0_60px_rgba(212,175,55,0.15)] animate-pulse-slow" style={{
                animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              }}>
                <UtensilsCrossed className="w-14 h-14 text-[#D4AF37]" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-wide"
                style={{
                  background: "linear-gradient(135deg, #D4AF37 0%, #FDF8F3 30%, #D4AF37 60%, #FDF8F3 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.1em",
                  direction: "rtl",
                  unicodeBidi: "plaintext",
                  lineHeight: 1.2
                }}>
              باب الخلق
            </h1>

            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="w-24 md:w-32 h-px bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-transparent"></div>
              <p className="text-base md:text-lg text-[#FDF8F3]/60 tracking-[0.3em] font-light uppercase">
                مذاق أصيل · جودة عالية
              </p>
              <div className="w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent"></div>
            </div>
          </div>
        </header>
      </AnimatedSection>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-16 relative z-10">
        <div className="space-y-24">
          {categories.map((category, catIndex) => {
            const categoryProducts = getProductsByCategory(category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <AnimatedSection key={category.id} delay={catIndex * 0.15}>
                <section className="group">
                  {/* Category Header */}
                  <div className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="text-[#D4AF37]/50">{category.icon}</div>
                      <h2 className="text-3xl md:text-4xl font-bold text-[#D4AF37] tracking-[0.25em] uppercase"
                          style={{ fontFamily: "'Playfair Display', serif" }}>
                        {category.name}
                      </h2>
                      <div className="text-[#D4AF37]/50">{category.icon}</div>
                    </div>

                    {/* Decorative Divider */}
                    <div className="flex items-center justify-center gap-3 mb-12">
                      <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/40"></div>
                      <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" style={{
                            animationDelay: `${i * 0.2}s`
                          }}></div>
                        ))}
                      </div>
                      <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/40"></div>
                    </div>
                  </div>

                  {/* Products Card */}
                  <div className="bg-[#181513]/90 backdrop-blur-md rounded-3xl border border-[#D4AF37]/10 p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D4AF37]/3 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative z-10 space-y-1">
                      {categoryProducts.map((product, index) => (
                        <div key={product.id || product.name}
                             className="flex justify-between items-center py-4 px-4 md:px-6 rounded-xl group/item hover:bg-[#D4AF37]/8 transition-all duration-400 border-x-2 border-transparent hover:border-[#D4AF37]/30"
                             style={{
                               borderBottom: index < categoryProducts.length - 1 ? "1px solid rgba(212,175,55,0.08)" : "none"
                             }}>
                          <span className="text-lg md:text-xl md:text-2xl font-semibold text-[#FDF8F3] group-hover/item:text-[#D4AF37] transition-colors duration-300"
                                style={{ fontFamily: "'Playfair Display', serif" }}>
                            {product.name}
                          </span>
                          <span className="text-2xl md:text-3xl font-black text-[#D4AF37] group-hover/item:scale-110 transition-transform duration-300"
                                style={{ fontFamily: "'Playfair Display', serif" }}>
                            {product.price} <span className="text-base md:text-lg font-normal opacity-70">ج.م</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Footer */}
        <AnimatedSection delay={0.8}>
          <footer className="mt-24 text-center py-16 border-t border-[#D4AF37]/10">
            {/* Company Logo */}
            <div className="mb-8 flex justify-center">
              <div className="p-6 bg-[#181513] rounded-full border-2 border-[#ff4444]/30 shadow-[0_0_40px_rgba(255,68,68,0.15)]">
                {/* Wanwir Logo SVG (Corrected for RTL) */}
                <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" stroke="#ff4444" strokeWidth="4" fill="#181513"/>
                  <path d="M75 75 L60 40 L50 60 L40 40 L25 75" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M60 40 L50 55 L40 40" stroke="#ff4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
            </div>

            <p className="text-[#FDF8F3]/60 tracking-[0.1em] text-base mb-2">
              إنتاج وتصميم المهندس أحمد شعلان
            </p>
            <p className="text-[#FDF8F3]/50 tracking-[0.1em] text-sm mb-2">
              مؤسس شركة Wanwir
            </p>
            <p className="text-[#D4AF37] tracking-[0.1em] text-sm mb-4">
              رقم التواصل: 01005058038
            </p>
            <p className="text-[#FDF8F3]/40 tracking-[0.2em] text-sm uppercase mb-2">
              للطلب، يرجى الاتصال بالنادل أو مسح رمز QR الموجود على الطاولة
            </p>
            <p className="text-[#D4AF37]/30 text-xs mt-4 tracking-[0.3em]">
              باب الخلق © 2025
            </p>
          </footer>
        </AnimatedSection>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
