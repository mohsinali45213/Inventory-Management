import React, { useEffect, useState } from "react";
import {
  Search,
  Edit,
  BarChart3,
  AlertTriangle,
  Package,
} from "lucide-react";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Alert from "../components/common/Alert";

import { Product, Category, Brand } from "../types";
import productService from "../functions/product";
import BrandService from "../functions/brand";
import CategoryService from "../functions/category";

const StockManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [newStock, setNewStock] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        productService.getAllProducts(),
        CategoryService.getAllCategories(),
        BrandService.getAllBrand()
      ]);

      setProducts(productsRes);
      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (error) {
      // Error loading data
    }
  };

  const getCategoryName = (id: string) => {
    return (categories || []).find((c : any) => c.id === id)?.name || 'Unknown';
  };

  const getBrandName = (id: string) => {
    return (brands || []).find((b : any) => b.id === id)?.name || 'Unknown';
  };

  const stockItems = products.flatMap((product) =>
    product.variants.map((variant) => ({
      productId: product.id,
      productName: product.name,
      categoryName: getCategoryName(product.categoryId),
      brandName: getBrandName(product.brandId),
      variantId: variant.id!,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      stock: variant.stock_qty,
      barcode: variant.barcode || "",
    }))
  );

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm);

    const matchesFilter =
      stockFilter === "all" ||
      (stockFilter === "low" && item.stock > 0 && item.stock <= 10) ||
      (stockFilter === "out" && item.stock === 0);

    return matchesSearch && matchesFilter;
  });

  const handleUpdateStock = async (variantId: string, newStock: number) => {
    try {
      const variant = products
        .flatMap(p => p.variants)
        .find(v => v.id === variantId);

      if (!variant) {
        setAlert({ type: "error", message: "Variant not found" });
        return;
      }

      const updatedVariant = { ...variant, stock_qty: newStock };
      const result = await productService.updateVariant(variantId, updatedVariant);

      if (result.success) {
        setAlert({ type: "success", message: "Stock updated successfully" });
        loadData();
        setIsUpdateModalOpen(false);
        setSelectedVariant(null);
        setNewStock("");
      } else {
        setAlert({ type: "error", message: result.message });
      }
    } catch (error) {
      // Error updating stock
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: "Out of Stock", class: "stock-out" };
    if (stock <= 5) return { status: "Critical", class: "stock-critical" };
    if (stock <= 10) return { status: "Low Stock", class: "stock-low" };
    return { status: "In Stock", class: "stock-normal" };
  };

  return (
    <div className="page stock-management-page">
      <div className="page-fade-in">
        {/* Modern Card Header */}
        <div className="stockmanagement-header-card" style={{marginBottom:'2rem', background:'linear-gradient(135deg, #1e40af 60%, #1e3a8a 100%)', color:'#fff', borderRadius:'18px', padding:'2.5rem 2rem 1.5rem 2rem', boxShadow:'0 4px 24px rgba(30,64,175,0.10)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'2em'}}>
            <div>
              <div className="stockmanagement-title" style={{fontSize:'2.1rem', fontWeight:700, marginBottom:'.2em', letterSpacing:'-1px'}}>Stock Management</div>
              <div className="stockmanagement-subtitle" style={{fontSize:'1.1rem', color:'#e0e7ef', fontWeight:400}}>Manage and update your product stock</div>
            </div>
            {/* Add button if needed */}
          </div>
        </div>
        {/* Controls Row */}
        <div className="stockmanagement-controls" style={{display:'flex', flexWrap:'wrap', gap:'2em', alignItems:'center', marginBottom:'2em'}}>
          {/* Add search/filter controls here if present in your page */}
        </div>
        <hr style={{border:'none', borderTop:'1px solid var(--secondary-200)', margin:'0 0 2em 0'}} />
        <div className="page-content">
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <div className="stock-summary">
            <div className="summary-card">
              <div className="summary-icon summary-icon-blue">
                <Package size={24} />
              </div>
              <div className="summary-content">
                <div className="summary-value">{stockItems.length}</div>
                <div className="summary-label">Total Items</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon summary-icon-orange">
                <AlertTriangle size={24} />
              </div>
              <div className="summary-content">
                <div className="summary-value">
                  {stockItems.filter((item) => item.stock > 0 && item.stock <= 10).length}
                </div>
                <div className="summary-label">Low Stock</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon summary-icon-red">
                <AlertTriangle size={24} />
              </div>
              <div className="summary-content">
                <div className="summary-value">
                  {stockItems.filter((item) => item.stock === 0).length}
                </div>
                <div className="summary-label">Out of Stock</div>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Variant</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.stock);
                  return (
                    <tr key={`${item.productId}-${item.variantId}`}>
                      <td>
                        <div className="product-cell">
                          <div className="product-image-placeholder">
                            <Package size={20} />
                          </div>
                          <div className="product-info">
                            <div className="product-name">{item.productName}</div>
                            <div className="product-barcode">Barcode: {item.barcode}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{item.categoryName}</span>
                      </td>
                      <td>
                        <span className="brand-badge">{item.brandName}</span>
                      </td>
                      <td>
                        <div className="variant-info">
                          <span className="variant-size">{item.size}</span>
                          <span className="variant-color">{item.color}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`stock-quantity ${stockStatus.class}`}>{item.stock}</span>
                      </td>
                      <td>
                        <span className={`stock-status ${stockStatus.class}`}>{stockStatus.status}</span>
                      </td>
                      <td>
                        <span className="price">₹{item.price.toLocaleString()}</span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          className="update-stock-btn"
                          onClick={() => {
                            setSelectedVariant(item);
                            setNewStock(item.stock.toString());
                            setIsUpdateModalOpen(true);
                          }}
                        >
                          <Edit size={14} /> Update Stock
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedVariant(null);
            setNewStock("");
          }}
          title="Update Stock"
        >
          {selectedVariant && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStock(selectedVariant.variantId, parseInt(newStock));
            }} className="stock-update-form">
              <div className="product-details">
                <h4>{selectedVariant.productName}</h4>
                <p>Size: {selectedVariant.size} • Color: {selectedVariant.color}</p>
                <p>
                  Current Stock: <strong>{selectedVariant.stock}</strong>
                </p>
                <p>Price: ₹{selectedVariant.price.toLocaleString()}</p>
              </div>

              <Input
                label="New Stock Quantity"
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter new stock quantity"
                min="0"
                required
              />

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedVariant(null);
                    setNewStock("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="update-stock-btn"
                >
                  Update Stock
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StockManagement;