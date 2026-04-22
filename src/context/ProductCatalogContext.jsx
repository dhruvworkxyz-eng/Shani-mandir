import { createContext, useContext, useEffect, useMemo, useState } from "react";
import baseProducts, { productCategories as baseProductCategories } from "../data/products";

const PRODUCT_CATALOG_STORAGE_KEY = "temple-admin-product-catalog";
const PRODUCT_CATALOG_EVENT = "temple-admin-product-catalog-updated";

const ProductCatalogContext = createContext(null);

const normalizeProduct = (product) => ({
  ...product,
  id: String(product.id),
  price: Number(product.price) || 0,
  oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
  rating: Number(product.rating) || 0,
  sale: Boolean(product.sale),
  discount: product.discount || "",
  image: product.image || "",
  images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image].filter(Boolean),
  specifications: Array.isArray(product.specifications) ? product.specifications : [],
  description: product.description || "",
  priceRangeLabel: product.priceRangeLabel || "",
});

const readStoredCatalog = () => {
  if (typeof window === "undefined") {
    return { added: [], overrides: {}, deletedIds: [] };
  }

  try {
    const storedValue = window.localStorage.getItem(PRODUCT_CATALOG_STORAGE_KEY);
    if (!storedValue) {
      return { added: [], overrides: {}, deletedIds: [] };
    }

    const parsedValue = JSON.parse(storedValue);
    return {
      added: Array.isArray(parsedValue?.added) ? parsedValue.added : [],
      overrides: parsedValue?.overrides && typeof parsedValue.overrides === "object" ? parsedValue.overrides : {},
      deletedIds: Array.isArray(parsedValue?.deletedIds) ? parsedValue.deletedIds.map(String) : [],
    };
  } catch {
    return { added: [], overrides: {}, deletedIds: [] };
  }
};

const mergeCatalog = (storedCatalog) => {
  const deletedIds = new Set(storedCatalog.deletedIds.map(String));

  const mergedBaseProducts = baseProducts
    .filter((product) => !deletedIds.has(String(product.id)))
    .map((product) => normalizeProduct(storedCatalog.overrides[String(product.id)] || product));

  const addedProducts = storedCatalog.added
    .filter((product) => !deletedIds.has(String(product.id)))
    .map(normalizeProduct);

  return [...mergedBaseProducts, ...addedProducts];
};

const writeStoredCatalog = (storedCatalog) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PRODUCT_CATALOG_STORAGE_KEY, JSON.stringify(storedCatalog));
  window.dispatchEvent(new CustomEvent(PRODUCT_CATALOG_EVENT));
};

export const ProductCatalogProvider = ({ children }) => {
  const [storedCatalog, setStoredCatalog] = useState(() => readStoredCatalog());

  useEffect(() => {
    const handleChange = () => {
      setStoredCatalog(readStoredCatalog());
    };

    window.addEventListener("storage", handleChange);
    window.addEventListener(PRODUCT_CATALOG_EVENT, handleChange);

    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(PRODUCT_CATALOG_EVENT, handleChange);
    };
  }, []);

  const products = useMemo(() => mergeCatalog(storedCatalog), [storedCatalog]);

  const productCategories = useMemo(() => {
    const discoveredCategories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
    const preferredOrder = baseProductCategories.filter((category) => category !== "All");
    const mergedCategories = [
      ...preferredOrder,
      ...discoveredCategories.filter((category) => !preferredOrder.includes(category)),
    ];

    return ["All", ...mergedCategories];
  }, [products]);

  const upsertStoredCatalog = (updater) => {
    setStoredCatalog((current) => {
      const nextValue = updater(current);
      writeStoredCatalog(nextValue);
      return nextValue;
    });
  };

  const createProduct = (productInput) => {
    const nextProduct = normalizeProduct({
      id: `custom-${Date.now()}`,
      ...productInput,
    });

    upsertStoredCatalog((current) => ({
      ...current,
      added: [nextProduct, ...current.added],
      deletedIds: current.deletedIds.filter((entry) => entry !== String(nextProduct.id)),
    }));
  };

  const updateProduct = (productId, productInput) => {
    const normalizedId = String(productId);
    const matchingBaseProduct = baseProducts.find((product) => String(product.id) === normalizedId);

    upsertStoredCatalog((current) => {
      if (matchingBaseProduct) {
        return {
          ...current,
          overrides: {
            ...current.overrides,
            [normalizedId]: normalizeProduct({
              ...(current.overrides[normalizedId] || matchingBaseProduct),
              ...productInput,
              id: normalizedId,
            }),
          },
        };
      }

      return {
        ...current,
        added: current.added.map((product) =>
          String(product.id) === normalizedId
            ? normalizeProduct({
                ...product,
                ...productInput,
                id: normalizedId,
              })
            : product
        ),
      };
    });
  };

  const deleteProduct = (productId) => {
    const normalizedId = String(productId);
    const isBaseProduct = baseProducts.some((product) => String(product.id) === normalizedId);

    upsertStoredCatalog((current) => ({
      added: current.added.filter((product) => String(product.id) !== normalizedId),
      overrides: Object.fromEntries(Object.entries(current.overrides).filter(([key]) => key !== normalizedId)),
      deletedIds: isBaseProduct && !current.deletedIds.includes(normalizedId) ? [...current.deletedIds, normalizedId] : current.deletedIds,
    }));
  };

  const resetCatalog = () => {
    const nextCatalog = { added: [], overrides: {}, deletedIds: [] };
    setStoredCatalog(nextCatalog);
    writeStoredCatalog(nextCatalog);
  };

  const value = useMemo(
    () => ({
      products,
      productCategories,
      createProduct,
      updateProduct,
      deleteProduct,
      resetCatalog,
    }),
    [createProduct, deleteProduct, productCategories, products, resetCatalog, updateProduct]
  );

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
};

export const useProductCatalog = () => {
  const context = useContext(ProductCatalogContext);

  if (!context) {
    throw new Error("useProductCatalog must be used within a ProductCatalogProvider.");
  }

  return context;
};
