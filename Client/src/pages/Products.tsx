import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye, Package } from "lucide-react";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProductService from "../functions/product";
import { Brand, Category, Product, ProductVariant } from "../types/index";
import CategoryService from "../functions/category";
import BrandService from "../functions/brand";
import SubCategoryService from "../functions/subCategory";
import Alert from "../components/common/Alert";
import { useModal } from "../context/ModalContext";

const Products: React.FC = () => {
  const { triggerAddModal, setTriggerAddModal } = useModal();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );

  const [isVariantEditMode, setIsVariantEditMode] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null
  );

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setAllCategories] = useState<Category[] | any[]>([]);
  const [subcategories, setSubcategories] = useState<Category[] | any[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Category[] | any[]>([]);
  const [allBrand, setAllBrand] = useState<Brand[] | any[]>([]);
  const [productName, setProductName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (triggerAddModal) {
      setIsAddModalOpen(true);
      if (setTriggerAddModal) setTriggerAddModal(false);
    }
  }, [triggerAddModal]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  type Variants = {
    id?: string;
    size: string;
    color: string;
    price: any;
    stock_qty: any;
  };
  const [variants, setVariants] = useState<Variants[]>([
    { id: "", size: "", color: "", price: "", stock_qty: "" },
  ]);

  const fetchAllProducts = async () => {
    try {
      const result = await ProductService.getAllProducts();
      setProducts(result);
    } catch (error) {
      // Failed to fetch products
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await CategoryService.getAllCategories();
      setAllCategories(categories || []);
    } catch (error) {
      setAllCategories([]);
    }
  };

  const getAllBrands = async () => {
    try {
      const brands = await BrandService.getAllBrand();
      setAllBrand(brands || []);
    } catch (error) {
      setAllBrand([]);
    }
  };

  const getAllSubCategories = async () => {
    try {
      const subCategories = await SubCategoryService.getAllSubCategories();
      setSubcategories(subCategories || []);
    } catch (error) {
      setSubcategories([]);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
    getAllBrands();
    getAllSubCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategoriesByCategory = async () => {
      if (selectedCategory) {
        try {
          const filtered = await SubCategoryService.getSubCategoriesByCategory(selectedCategory);
          setFilteredSubcategories(filtered);
        } catch (error) {
          setFilteredSubcategories([]);
        }
      } else {
        setFilteredSubcategories([]);
      }
      setSelectedSubcategory("");
    };

    fetchSubcategoriesByCategory();
  }, [selectedCategory]);

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const productPrices = product.variants.map((v: any) => v.price);
        const lowest = Math.min(...productPrices);
        const highest = Math.max(...productPrices);

        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.subCategoryId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (categories || [])
            .find((c) => c.id === product.categoryId)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (allBrand || [])
            .find((b) => b.id === product.brandId)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory
          ? product.categoryId.toString() === selectedCategory
          : true;

        const matchesBrand = selectedBrand
          ? product.brandId.toString() === selectedBrand
          : true;

        const matchesMinPrice = minPrice
          ? lowest >= parseFloat(minPrice)
          : true;
        const matchesMaxPrice = maxPrice
          ? highest <= parseFloat(maxPrice)
          : true;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesBrand &&
          matchesMinPrice &&
          matchesMaxPrice
        );
      })
    : [];

  // Toggle product expansion
  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    newExpanded.has(productId)
      ? newExpanded.delete(productId)
      : newExpanded.add(productId);
    setExpandedProducts(newExpanded);
  };

  // These functions can be used in the table to display stock and price information
  // Helper functions to calculate total stock and lowest price
  // They are not used in the current code but can be useful for future enhancements
  const getTotalStock = (variants: any[]) => {
    return variants.reduce((sum, variant) => sum + variant.stock_qty, 0);
  };

  const getLowestPrice = (variants: any[]) => {
    return Math.min(...variants.map((v) => v.price));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: "", size: "", color: "", price: "", stock_qty: "" },
    ]);
  };

  const handleVariantChange = (
    index: number,
    key: keyof ProductVariant,
    value: any
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product and all its variants?"
    );
    if (!confirmDelete) return;

    const result = await ProductService.deleteProductWithVariants(productId);

    if (result.success) {
      setAlert({ type: "success", message: "Product deleted successfully." });
      // ✅ Optionally update local state or refetch list
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setAlert({
        type: "error",
        message: `Failed to delete product: ${result.message}`,
      });
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this variant?"
    );
    if (!confirmDelete) return;

    const result = await ProductService.deleteProductVariant(variantId);

    if (result.success) {
      // Optionally refresh the list or update state
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      setAlert({ type: "success", message: "Variant deleted successfully." });
    } else {
      setAlert({
        type: "error",
        message: `Failed to delete variant: ${result.message}`,
      });
    }
    fetchAllProducts(); // Refresh products after deletion
  };

  // ✅ Handle form submission for both create and update
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      setAlert({ type: "error", message: "Product name is required" });
      return;
    }

    if (!selectedCategory) {
      setAlert({ type: "error", message: "Please select a category" });
      return;
    }

    if (!selectedSubcategory) {
      setAlert({ type: "error", message: "Please select a subcategory" });
      return;
    }

    if (!selectedBrand) {
      setAlert({ type: "error", message: "Please select a brand" });
      return;
    }

    const validVariants = variants.filter(
      (variant) =>
        variant.size.trim() &&
        variant.color.trim() &&
        variant.price !== "" &&
        variant.stock_qty !== ""
    );

    if (validVariants.length === 0) {
      setAlert({ type: "error", message: "At least one variant is required" });
      return;
    }

    const productData: Product = {
      id: "",
      name: productName,
      categoryId: selectedCategory,
      subCategoryId: selectedSubcategory,
      brandId: selectedBrand,
      variants: validVariants.map((variant) => ({
        id: variant.id || "",
        size: variant.size,
        color: variant.color,
        price: Number(variant.price),
        stock_qty: Number(variant.stock_qty),
        barcode: "",
      })),
    };

    try {
      if (isEditMode && editingProductId) {
        const result = await ProductService.updateProductWithVariants(
          editingProductId,
          productData,
          validVariants
        );

        if (result.success) {
          setAlert({ type: "success", message: "Product updated successfully" });
          fetchAllProducts();
          setIsAddModalOpen(false);
          resetForm();
        } else {
          setAlert({ type: "error", message: result.message });
        }
      } else {
        const result = await ProductService.createProductWithVariants(productData);

        if (result.success) {
          setAlert({ type: "success", message: "Product added successfully" });
          fetchAllProducts();
          setIsAddModalOpen(false);
          resetForm();
        } else {
          setAlert({ type: "error", message: result.message });
        }
      }
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to submit product" });
    }
  };

  const resetForm = () => {
    setProductName("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    setVariants([{ id: "", size: "", color: "", price: 0, stock_qty: 0 }]);
    setFilteredSubcategories([]);

    // Reset edit states
    setIsEditMode(false);
    setEditingProductId(null);

    // ✅ Also reset variant edit state
    setIsVariantEditMode(false);
    setEditingVariantIndex(null);
    setSelectedProduct(null);

    // Optionally close the modal
    setIsAddModalOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    setProductName(product.name);
    setSelectedCategory(product.categoryId);
    setSelectedSubcategory(product.subCategoryId);
    setSelectedBrand(product.brandId);
    setVariants(
      product.variants.map((variant) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        price: variant.price.toString(),
        stock_qty: variant.stock_qty.toString(),
      }))
    );
    setEditingProductId(product.id);
    setIsEditMode(true);

    // 2. Format and set variant fields
    const formattedVariants = product.variants.map((variant: any) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      stock_qty: variant.stock_qty,
    }));

    setVariants(formattedVariants);

    // 3. Set mode + ID
    setEditingProductId(product.id);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  // Handle update variant
  const handleUpdateVariant = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingVariantIndex) return;

    const variant = variants[editingVariantIndex];
    if (!variant.size.trim() || !variant.color.trim() || !variant.price || !variant.stock_qty) {
      setAlert({ type: "error", message: "All variant fields are required" });
      return;
    }

    try {
      const result = await ProductService.updateVariant(variant.id!, {
        size: variant.size,
        color: variant.color,
        price: Number(variant.price),
        stock_qty: Number(variant.stock_qty),
      });

      if (result.success) {
        setAlert({ type: "success", message: "Variant updated successfully" });
        fetchAllProducts();
        setIsAddModalOpen(false);
        resetForm();
      } else {
        setAlert({ type: "error", message: result.message });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to update variant" });
    }
  };

  const variantList =
    isVariantEditMode &&
    editingVariantIndex !== null &&
    variants[editingVariantIndex] !== undefined
      ? [variants[editingVariantIndex]]
      : variants;

  const handleEditVariant = (product: Product, variantId: number) => {
    setProductName(product.name);
    setSelectedCategory(product.categoryId);
    setSelectedSubcategory(product.subCategoryId);
    setSelectedBrand(product.brandId);
    setVariants(product.variants);
    setEditingVariantIndex(variantId); // Set the index of the variant being edited
    setIsVariantEditMode(true);
    setIsAddModalOpen(true);
  };

  return (
    <div className="page products-page">
      <div className="page-fade-in">
        {/* Modern Card Header */}
        <div className="products-header-card" style={{marginBottom:'2rem', background:'linear-gradient(135deg, #1e40af 60%, #1e3a8a 100%)', color:'#fff', borderRadius:'18px', padding:'2.5rem 2rem 1.5rem 2rem', boxShadow:'0 4px 24px rgba(30,64,175,0.10)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'2em'}}>
            <div>
              <div className="products-title" style={{fontSize:'2.1rem', fontWeight:700, marginBottom:'.2em', letterSpacing:'-1px'}}>Products</div>
              <div className="products-subtitle" style={{fontSize:'1.1rem', color:'#e0e7ef', fontWeight:400}}>Manage your product inventory</div>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="primary">
              <Plus size={16} />
              Add Product
            </Button>
          </div>
        </div>
        {/* Controls Row */}
        <div className="products-controls" style={{display:'flex', flexWrap:'wrap', gap:'2em', alignItems:'center', marginBottom:'2em'}}>
          <div className="filters-section" style={{flex:'1 1 320px', minWidth:220}}>
            <div className="search-filter" style={{display:'flex', gap:16, alignItems:'center'}}>
              <div className="search-input-container" style={{flex:1}}>
                <Search className="search-input-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search products, categories, brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{width:'100%'}}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{height:'40px'}}
              >
                <Filter size={16} />
                Filters
              </Button>
            </div>
            {isFilterOpen && (
              <div className="filter-dropdown-container">
                <div className="filter-select-group">
                  <select
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {(categories || []).map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="filter-select"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    <option value="">All Brands</option>
                    {(allBrand || []).map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="filter-select"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    className="filter-select"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
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
          <div className="products-table-card" style={{boxShadow:'0 2px 12px rgba(30,64,175,0.07)', borderRadius:'16px', background:'#fff', overflow:'hidden'}}>
            <table className="products-table" style={{width:'100%', borderCollapse:'collapse', fontSize:'1rem'}}>
              <thead>
                <tr style={{background:'#f3f6fa'}}>
                  <th style={{padding:'1em', fontWeight:700, color:'#1e293b', textAlign:'left'}}>Product Details</th>
                  <th style={{padding:'1em', fontWeight:700, color:'#1e293b', textAlign:'left'}}>Category</th>
                  <th style={{padding:'1em', fontWeight:700, color:'#1e293b', textAlign:'left'}}>Brand</th>
                  <th style={{padding:'1em', fontWeight:700, color:'#1e293b', textAlign:'left'}}>Total Stock</th>
                  <th style={{padding:'1em', fontWeight:700, color:'#1e293b', textAlign:'left'}}>Price Range</th>
                  <th style={{padding:'1em', fontWeight:700, color:'#1e293b', textAlign:'left'}}>Variants</th>
                  <th style={{padding:'1em', fontWeight:700, color:'#1e293b', textAlign:'left'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, idx) => (
                  <React.Fragment key={product.id}>
                    <tr
                      className="product-row"
                      style={{
                        background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                        transition: 'background 0.18s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#e0e7ef')}
                      onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f8fafc')}
                    >
                      <td style={{padding:'1em'}}>
                        <div className="product-cell">
                          <div className="product-image-placeholder">
                            <Package size={24} />
                          </div>
                          <div className="product-info">
                            <div className="product-name">{product.name}</div>
                            {product.subCategoryId && (
                              <div className="product-subcategory">
                                {product.subCategoryId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{padding:'1em'}}>
                        <span className="category-badge">
                          {(categories || []).find(
                            (category) => category.id === product.categoryId
                          )?.name || "Unknown"}
                        </span>
                      </td>
                      <td style={{padding:'1em'}}>
                        <span className="category-badge">
                          {(allBrand || []).find((brand) => brand.id === product.brandId)
                            ?.name || "Unknown"}
                        </span>
                      </td>
                      <td style={{padding:'1em'}}>
                        <span
                          className={`stock-indicator ${
                            getTotalStock(product.variants) <= 10
                              ? "stock-low"
                              : "stock-normal"
                          }`}
                        >
                          {getTotalStock(product.variants)}
                        </span>
                      </td>
                      <td style={{padding:'1em'}}>
                        <span className="price-range">
                          ₹{getLowestPrice(product.variants).toLocaleString()}
                          {product.variants.length > 1 &&
                            " - ₹" +
                              Math.max(
                                ...product.variants.map((v: any) => v.price)
                              ).toLocaleString()}
                        </span>
                      </td>
                      <td style={{padding:'1em'}}>
                        <button
                          className="variant-toggle"
                          onClick={() => toggleProductExpansion(product.id)}
                        >
                          <Eye size={16} />
                          {product.variants.length} variants
                        </button>
                      </td>
                      <td style={{padding:'1em'}}>
                        <div className="action-buttons">
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedProducts.has(product.id) && (
                      <tr className="variants-row">
                        <td colSpan={7} style={{background:'#f8fafc', padding:'1em 2em'}}>
                          <div className="variants-container">
                            <h4>Product Variants</h4>
                            <div className="variants-grid">
                              {product.variants.map((variant: any) => (
                                <div key={variant.id} className="variant-card">
                                  <div className="variant-info">
                                    <div className="variant-details">
                                      <span className="variant-size">
                                        {variant.size}
                                      </span>
                                      <span className="variant-color">
                                        {variant.color}
                                      </span>
                                    </div>
                                    <div className="variant-price">
                                      ₹{variant.price.toLocaleString()}
                                    </div>
                                    <div
                                      className={`variant-stock ${
                                        variant.stock_qty <= 5
                                          ? "stock-critical"
                                          : variant.stock_qty <= 10
                                          ? "stock-low"
                                          : "stock-normal"
                                      }`}
                                    >
                                      Stock: {variant.stock_qty}
                                    </div>
                                    <div className="variant-barcode">
                                      {variant.barcode}
                                    </div>
                                  </div>
                                  <div className="variant-actions">
                                    <button
                                      className="variant-action-btn variant-action-edit"
                                      onClick={() => {
                                        const variantIndex =
                                          product.variants.findIndex(
                                            (v) => v.id === variant.id
                                          );
                                        setSelectedProduct(product);
                                        setVariants(product.variants);
                                        setEditingVariantIndex(variantIndex);
                                        handleEditVariant(product, variantIndex);
                                        setIsVariantEditMode(true);
                                        setIsAddModalOpen(true);
                                      }}
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      className="variant-action-btn variant-action-delete"
                                      onClick={() =>
                                        handleDeleteVariant(variant.id)
                                      }
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="empty-state products-empty-state" style={{textAlign:'center', padding:'2.5em 0 2em 0', color:'#64748b'}}>
                <Package size={48} style={{opacity:0.2, marginBottom:8}} />
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>
        {(isEditMode || isAddModalOpen || isVariantEditMode) && (
          <Modal
            isOpen={isEditMode || isAddModalOpen || isVariantEditMode}
            onClose={() => {
              setIsEditMode(false);
              setIsAddModalOpen(false);
              setIsVariantEditMode(false);
              resetForm();
            }}
            title={
              isVariantEditMode
                ? "Edit Variant"
                : isEditMode
                ? "Edit Product"
                : "Add New Product"
            }
            size="lg"
          >
            <form
              className="product-form"
              onSubmit={isVariantEditMode ? handleUpdateVariant : handleAddProduct}
            >
              <div className="form-row">
                <Input
                  label="Product Name"
                  placeholder="Enter product name"
                  required
                  disabled={isVariantEditMode}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <div className="form-subcategory">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    required
                    disabled={isVariantEditMode}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {(categories || []).map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sub Category *</label>
                  <select
                    className="form-select"
                    required
                    disabled={isVariantEditMode || !selectedCategory}
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                  >
                    <option value="" disabled>
                      {selectedCategory ? "Select Subcategory" : "Select Category First"}
                    </option>
                    {(filteredSubcategories || []).map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <select
                    className="form-select"
                    required
                    disabled={isVariantEditMode}
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Brand
                    </option>
                    {(allBrand || []).map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="variants-section">
                <h4>Product Variants</h4>

                {variantList.map((variant, index) => {
                  const isEditable = isVariantEditMode ? index === 0 : true; // Only first variant editable when in editVariant mode

                  return (
                    <div
                      key={index}
                      className="variant-form border p-3 rounded-md shadow mb-4"
                    >
                      <div className="form-row">
                        <Input
                          label="Size"
                          value={variant.size}
                          required
                          placeholder="Enter size"
                          onChange={(e) =>
                            handleVariantChange(
                              isVariantEditMode ? editingVariantIndex! : index,
                              "size",
                              e.target.value
                            )
                          }
                          disabled={!isEditable}
                        />
                        <Input
                          label="Color"
                          value={variant.color}
                          required
                          placeholder="Enter color"
                          onChange={(e) =>
                            handleVariantChange(
                              isVariantEditMode ? editingVariantIndex! : index,
                              "color",
                              e.target.value
                            )
                          }
                          disabled={!isEditable}
                        />
                        <Input
                          label="Price"
                          type="number"
                          required
                          placeholder="Enter price"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(
                              isVariantEditMode ? editingVariantIndex! : index,
                              "price",
                              e.target.value === "" ? "" : Number(e.target.value)
                            )
                          }
                          disabled={!isEditable}
                        />
                        <Input
                          label="Stock"
                          type="number"
                          required
                          placeholder="Enter stock quantity"
                          value={variant.stock_qty === "" ? "" : variant.stock_qty}
                          onChange={(e) =>
                            handleVariantChange(
                              isVariantEditMode ? editingVariantIndex! : index,
                              "stock_qty",
                              e.target.value === "" ? "" : Number(e.target.value)
                            )
                          }
                          disabled={!isEditable}
                        />

                        {!isVariantEditMode && variants.length > 1 && (
                          <div className="text-right mt-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveVariant(index)}
                            >
                              Remove Variant
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!isVariantEditMode && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddVariant}
                    >
                      Add Variant
                    </Button>
                  </>
                )}
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    setIsAddModalOpen(false);
                    setIsVariantEditMode(false);
                    setEditingVariantIndex(null);
                    resetForm(); // Reset form state
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit">
                  {isVariantEditMode
                    ? "Update Variant"
                    : isEditMode
                    ? "Update Product"
                    : "Add Product"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Products;
