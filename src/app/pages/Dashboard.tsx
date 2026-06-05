import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Coffee, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Upload,
  X,
  Home,
  Flame,
  Snowflake
} from "lucide-react";
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  uploadImage,
  signOut,
  getSession
} from "../api";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { QRCodeInfo } from "../components/QRCodeInfo";

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    category: "قهوة ساخنة",
    image: "",
    available: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      loadProducts();
    } catch (error) {
      navigate("/login");
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("فشل تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("فشل تسجيل الخروج");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImage(file);
      setFormData({ ...formData, image: result.url });
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, formData);
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        await createProduct(formData);
        toast.success("تم إضافة المنتج بنجاح");
      }
      
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("فشل حفظ المنتج");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      await deleteProduct(id);
      toast.success("تم حذف المنتج بنجاح");
      loadProducts();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("فشل حذف المنتج");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "قهوة ساخنة",
      image: "",
      available: true,
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingProduct(null);
    setShowModal(true);
  };

  const categories = [
    { id: "قهوة ساخنة", label: "☕ مشروبات ساخنة" },
    { id: "شاي ومشروبات عشبية", label: "🍵 شاي ومشروبات عشبية" },
    { id: "مشروبات باردة", label: "🧊 مشروبات باردة" },
    { id: "عصائر فريش", label: "🍹 عصائر فريش" },
    { id: "مشروبات غازية ومياه", label: "🥤 مشروبات غازية ومياه" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Coffee className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold">لوحة التحكم</h1>
                <p className="text-primary-foreground/80 text-sm">إدارة منتجات الكافيه</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">المنيو</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-destructive hover:bg-destructive/90 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-card p-6 rounded-xl shadow-md border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-foreground">{products.length}</p>
              </div>
              <Coffee className="w-12 h-12 text-primary" />
            </div>
          </div>

          {categories.slice(0, 4).map((cat) => (
            <div key={cat.id} className="bg-card p-6 rounded-xl shadow-md border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{cat.label}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {products.filter(p => p.category === cat.id).length}
                  </p>
                </div>
                {cat.id === "قهوة ساخنة" && <Flame className="w-12 h-12 text-orange-500" />}
                {cat.id === "مشروبات باردة" && <Snowflake className="w-12 h-12 text-blue-500" />}
                {(cat.id !== "قهوة ساخنة" && cat.id !== "مشروبات باردة") && <Coffee className="w-12 h-12 text-primary" />}
              </div>
            </div>
          ))}
        </div>

        {/* QR Code Info */}
        <QRCodeInfo />

        {/* Add Product Button */}
        <div className="mb-6">
          <button
            onClick={openAddModal}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة منتج جديد
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الصورة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">القسم</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">السعر</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      لا توجد منتجات. قم بإضافة منتج جديد للبدء.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.category === "قهوة ساخنة" || product.category === "شاي ومشروبات عشبية"
                            ? "bg-orange-100 text-orange-700" 
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {categories.find(c => c.id === product.category)?.label || product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {product.price} ج.م
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.available 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {product.available ? "متوفر" : "غير متوفر"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="text-2xl font-bold text-foreground">
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  صورة المنتج
                </label>
                {formData.image && (
                  <ImageWithFallback
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-5 h-5" />
                  <span>{uploading ? "جاري الرفع..." : "رفع صورة"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    السعر (ج.م) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    القسم *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="قهوة ساخنة">☕ مشروبات ساخنة</option>
                    <option value="شاي ومشروبات عشبية">🍵 شاي ومشروبات عشبية</option>
                    <option value="مشروبات باردة">🧊 مشروبات باردة</option>
                    <option value="عصائر فريش">🍹 عصائر فريش</option>
                    <option value="مشروبات غازية ومياه">🥤 مشروبات غازية ومياه</option>
                  </select>
                </div>
              </div>

              {/* Available */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="available" className="text-sm font-semibold text-foreground">
                  المنتج متوفر
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                {editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}