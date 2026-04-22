import React, { useEffect, useMemo, useRef, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import logo from "../images/navd.png";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { FaChevronDown, FaMagnifyingGlass, FaRightFromBracket, FaUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import products from "../data/products";
import pujas from "../data/pujas";

const shopCategories = [
  "Gemstone",
  "Stone Bracelets",
  "Rudraksha",
  "Havan Samagari",
  "Temple Products",
  "Stone Yantra Pendant",
];

const productSearchCategories = new Set(shopCategories);

const Header = ({ cartCount = 0, onOpenAuth, onOpenDonation, onOpenCart, onOpenShopCategory }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const headerOffset = 150;
  const profileMenuRef = useRef(null);
  const shopMenuRef = useRef(null);
  const searchShellRefs = useRef([]);
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const { t, toggleLanguage, translateCategory } = useLanguage();

  const profileLabel = useMemo(() => {
    if (!user) {
      return "";
    }

    return user.displayName?.trim() || user.email?.split("@")[0] || "User";
  }, [user]);

  const profileInitials = useMemo(() => {
    if (!profileLabel) {
      return "U";
    }

    return profileLabel
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profileLabel]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    const productMatches = products
      .filter((product) =>
        [product.name, product.category, product.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      )
      .slice(0, 5)
      .map((product) => ({
        id: `product-${product.id}`,
        type: "product",
        label: product.name,
        meta: productSearchCategories.has(product.category)
          ? translateCategory(product.category)
          : t("nav.templeProduct", "Temple Product"),
        path: `/products/${product.id}`,
      }));

    const pujaMatches = pujas
      .filter((puja) =>
        [puja.name, puja.title, puja.category, puja.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      )
      .slice(0, 5)
      .map((puja) => ({
        id: `puja-${puja.id}`,
        type: "puja",
        label: puja.title || puja.name,
        meta: puja.category || t("nav.puja", "Puja"),
        path: `/pujas/${puja.id}`,
      }));

    return [...productMatches, ...pujaMatches].slice(0, 8);
  }, [searchQuery, t, translateCategory]);

  const suggestedProducts = useMemo(
    () =>
      products
        .slice()
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5)
        .map((product) => ({
          id: `suggested-product-${product.id}`,
          type: "product",
          label: product.name,
          meta: productSearchCategories.has(product.category)
            ? translateCategory(product.category)
            : t("nav.templeProduct", "Temple Product"),
          path: `/products/${product.id}`,
        })),
    [t, translateCategory]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target)) {
        setShopMenuOpen(false);
      }
      const clickedInsideSearch = searchShellRefs.current.some((node) => node && node.contains(event.target));
      if (!clickedInsideSearch) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleClick = (index, id) => {
    setActiveIndex(index);
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    }
    setOpen(false);
  };

  const openLoginPage = () => {
    setOpen(false);
    setProfileMenuOpen(false);
    onOpenAuth?.();
  };

  const goToShop = () => {
    onOpenCart?.();
    setOpen(false);
  };

  const openShopCategory = (category) => {
    setActiveIndex(1);
    setShopMenuOpen(false);
    setOpen(false);

    if (typeof onOpenShopCategory === "function") {
      onOpenShopCategory(category);
      return;
    }

    navigate("/", {
      state: {
        shopCategory: category,
      },
    });
  };

  const openAccountPage = () => {
    setProfileMenuOpen(false);
    setOpen(false);
    navigate("/account");
  };

  const openAccountSection = (hash) => {
    setProfileMenuOpen(false);
    setOpen(false);
    navigate(`/account${hash}`);
  };

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    setOpen(false);
    await logout?.();
    navigate("/");
  };

  const handleResultSelect = (path) => {
    setSearchQuery("");
    setSearchOpen(false);
    setOpen(false);
    navigate(path);
  };

  const renderSearchResults = (isMobile = false) => {
    if (!searchOpen) {
      return null;
    }

    const hasQuery = Boolean(searchQuery.trim());
    const results = hasQuery ? searchResults : suggestedProducts;

    return (
      <div className={`header-search-results ${isMobile ? "header-search-results-mobile" : ""}`}>
        {!hasQuery ? <div className="header-search-results-label">{t("suggested", "Suggested")}</div> : null}
        {results.length > 0 ? (
          results.map((result) => (
            <button key={result.id} type="button" className="header-search-result-item" onClick={() => handleResultSelect(result.path)}>
              <span className="header-search-result-title">{result.label}</span>
              <span className="header-search-result-meta">
                {result.type === "puja" ? t("nav.puja", "Puja") : t("nav.templeProduct", "Temple Product")} - {result.meta}
              </span>
            </button>
          ))
        ) : (
          <div className="header-search-empty">{t("nav.searchEmpty", "No matching pujas or temple products found.")}</div>
        )}
      </div>
    );
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    if (searchResults.length > 0) {
      handleResultSelect(searchResults[0].path);
      return;
    }

    navigate("/");
    setOpen(false);
  };

  return (
    <div
      className="fixed top-[38px] w-full px-6 pt-3 pb-1 z-50 overflow-visible"
      style={{
        background:
          "linear-gradient(90deg, rgba(253, 190, 87, 1) 0%, rgba(252, 187, 88, 1) 10%, rgba(244, 119, 40, 1) 40%, rgba(244, 119, 40, 1) 100%)",
        borderBottomLeftRadius: open ? "0px" : "30px",
        borderBottomRightRadius: open ? "0px" : "30px",
        zIndex: "1000",
      }}
    >
      <div className="nav-pattern absolute inset-0 opacity-20 pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between w-full md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-4">
        <div className="hidden min-w-0 items-center gap-3 md:flex">
          <img src={logo} alt="Logo" className="h-12 w-12 rounded-full" />
          <div className="min-w-0 leading-tight">
            <h2 className="text-white font-bold text-base">{t("nav.templeName", "Shani Dham Mandir")}</h2>
          </div>
        </div>

        <div className="hidden min-w-0 md:flex md:justify-center md:px-4 lg:px-6 xl:px-10">
          <nav className="min-w-0">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-bold text-sm tracking-wide lg:text-base xl:gap-x-7">
              <li className={`nav-item text-white cursor-pointer ${activeIndex === 0 ? "text-blue-900" : ""}`} onClick={() => handleClick(0, "home")}>
                {t("nav.home", "Home")}
              </li>
              <li className={`nav-item relative text-white cursor-pointer ${activeIndex === 1 ? "text-blue-900" : ""}`} ref={shopMenuRef}>
                <button type="button" className="header-shop-trigger" onClick={() => setShopMenuOpen((current) => !current)}>
                  <span>{t("nav.shop", "Shop")}</span>
                  <FaChevronDown className={shopMenuOpen ? "header-chevron header-chevron-open" : "header-chevron"} />
                </button>
                {shopMenuOpen ? (
                  <div className="header-shop-menu">
                    {shopCategories.map((category) => (
                      <button key={category} type="button" className="header-shop-menu-item" onClick={() => openShopCategory(category)}>
                        {translateCategory(category)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </li>
              <li className={`nav-item text-white cursor-pointer ${activeIndex === 2 ? "text-blue-900" : ""}`} onClick={() => handleClick(2, "puja")}>
                {t("nav.onlinePuja", "Online Puja Booking")}
              </li>
              <li className={`nav-item text-white cursor-pointer ${activeIndex === 3 ? "text-blue-900" : ""}`} onClick={() => handleClick(3, "kundali")}>
                {t("nav.kundali", "Kundali")}
              </li>
              <li className={`nav-item text-white cursor-pointer ${activeIndex === 4 ? "text-blue-900" : ""}`} onClick={() => handleClick(4, "about-mandir")}>
                {t("nav.aboutMandir", "About Mandir")}
              </li>
              <li className={`nav-item text-white cursor-pointer ${activeIndex === 5 ? "text-blue-900" : ""}`} onClick={() => handleClick(5, "contact")}>
                {t("nav.contact", "Contact")}
              </li>
            </ul>
          </nav>
        </div>

        <div className="hidden min-w-0 flex-wrap items-center justify-end gap-3 md:flex lg:gap-4">
          <button type="button" className="header-lang-btn" onClick={toggleLanguage}>
            {t("nav.language", "à¤¹à¤¿à¤‚à¤¦à¥€")}
          </button>

          <form
            ref={(node) => {
              searchShellRefs.current[0] = node;
            }}
            className="header-search-shell"
            onSubmit={handleSearchSubmit}
          >
            <div className="header-search-box">
              <FaMagnifyingGlass className="header-search-icon" />
              <input
                type="search"
                className="header-search-input"
                placeholder={t("nav.searchPlaceholder", "Search puja or product")}
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                aria-label={t("nav.searchPlaceholder", "Search puja or product")}
              />
            </div>
            {renderSearchResults()}
          </form>

          {user ? (
            <div className="header-account-actions" ref={profileMenuRef}>
              <div className="relative">
                <button type="button" className="header-profile-btn" onClick={() => setProfileMenuOpen((current) => !current)} aria-label={t("nav.myAccount", "My Account")}>
                  <span className="header-profile-avatar">{profileInitials}</span>
                  <FaChevronDown className={profileMenuOpen ? "header-chevron header-chevron-open" : "header-chevron"} />
                </button>

                {profileMenuOpen ? (
                  <div className="header-profile-menu">
                    <div className="header-profile-menu-user">
                      <span>{profileLabel}</span>
                      <small>{user.email}</small>
                    </div>
                    <button type="button" className="header-profile-menu-item header-profile-menu-item-secondary" onClick={openAccountPage}>
                      <FaUser />
                      {t("nav.myAccount", "My Account")}
                    </button>
                    <button type="button" className="header-profile-menu-item header-profile-menu-item-secondary" onClick={() => openAccountSection("#track-order")}>
                      <FaUser />
                      {t("account.trackOrderTitle", "Track Order")}
                    </button>
                    <button type="button" className="header-profile-menu-item header-profile-menu-item-secondary" onClick={() => openAccountSection("#order-history")}>
                      <FaUser />
                      {t("account.orderHistoryTitle", "Order History")}
                    </button>
                    <button type="button" className="header-profile-menu-item header-profile-menu-item-secondary" onClick={() => openAccountSection("#temple-donation-history")}>
                      <FaUser />
                      {t("account.donationHistoryLabel", "Donation History")}
                    </button>
                    <button type="button" className="header-profile-menu-item header-profile-menu-item-secondary" onClick={() => openAccountSection("#puja-history")}>
                      <FaUser />
                      {t("account.pujaHistoryTitle", "Puja History")}
                    </button>
                    <button type="button" className="header-profile-menu-item header-profile-menu-item-secondary" onClick={() => openAccountSection("#temple-donation-history")}>
                      <FaUser />
                      {t("account.donationHistoryTitle", "Temple Donation History")}
                    </button>
                    <button type="button" className="header-profile-menu-item" onClick={handleLogout}>
                      <FaRightFromBracket />
                      {t("nav.logout", "Logout")}
                    </button>
                  </div>
                ) : null}
              </div>

            </div>
          ) : !loading ? (
            <button type="button" className="header-login-btn" onClick={openLoginPage}>
              <FaUserCircle />
            </button>
          ) : null}

          <button
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-[#7c2d12] via-[#9a3412] to-[#c2410c] shadow-[0_10px_25px_rgba(122,45,18,0.35)] border border-orange-200/30 hover:scale-105 transition-all duration-300"
            onClick={goToShop}
          >
            <FaShoppingCart size={18} />
            <span>{t("nav.cart", "Cart")}</span>
            <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1 rounded-full bg-yellow-300 text-red-900 text-xs font-bold flex items-center justify-center shadow-md">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            className="px-6 py-2 text-base font-bold text-white rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-[0_8px_20px_rgba(255,120,0,0.35)] border border-yellow-200/40 hover:scale-105 transition-all duration-300"
            onClick={onOpenDonation}
          >
            {t("nav.donate", "Donate")}
          </button>
        </div>

        <div className="absolute right-0 md:hidden z-50 text-white">
          {open ? <CloseIcon onClick={() => setOpen(false)} className="cursor-pointer text-3xl" /> : <MenuIcon onClick={() => setOpen(true)} className="cursor-pointer text-3xl" />}
        </div>

        <div className="absolute left-0 md:hidden flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-9 w-9 rounded-full" />
        </div>
      </div>

      <nav
        className={`fixed top-0 right-0 transform transition-transform duration-300 ease-in-out z-40 md:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{
          width: "100vw",
          top: "107px",
          background:
            "linear-gradient(90deg, rgba(253, 190, 87, 1) 0%, rgba(252, 187, 88, 1) 10%, rgba(244, 119, 40, 1) 40%, rgba(244, 119, 40, 1) 100%)",
        }}
      >
        <ul className="flex flex-col gap-6 p-8 font-bold h-full">
          <li>
            <button type="button" className="header-lang-btn header-lang-btn-mobile" onClick={toggleLanguage}>
              {t("nav.language", "à¤¹à¤¿à¤‚à¤¦à¥€")}
            </button>
          </li>
          <li>
            <form
              ref={(node) => {
                searchShellRefs.current[1] = node;
              }}
              className="header-search-shell header-search-shell-mobile"
              onSubmit={handleSearchSubmit}
            >
              <div className="header-search-box">
                <FaMagnifyingGlass className="header-search-icon" />
                <input
                  type="search"
                  className="header-search-input"
                  placeholder={t("nav.searchPlaceholder", "Search puja or product")}
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  aria-label={t("nav.searchPlaceholder", "Search puja or product")}
                />
              </div>
              {renderSearchResults(true)}
            </form>
          </li>
          <li className="nav-item text-white cursor-pointer" onClick={() => handleClick(0, "home")}>
            {t("nav.home", "Home")}
          </li>
          <li className="nav-item text-white cursor-pointer">
            <button type="button" className="header-mobile-shop-trigger" onClick={() => setShopMenuOpen((current) => !current)}>
              <span>{t("nav.shop", "Shop")}</span>
              <FaChevronDown className={shopMenuOpen ? "header-chevron header-chevron-open" : "header-chevron"} />
            </button>
            {shopMenuOpen ? (
              <div className="header-mobile-shop-menu">
                {shopCategories.map((category) => (
                  <button key={category} type="button" className="header-mobile-shop-item" onClick={() => openShopCategory(category)}>
                    {translateCategory(category)}
                  </button>
                ))}
              </div>
            ) : null}
          </li>
          <li className="nav-item text-white cursor-pointer" onClick={() => handleClick(2, "puja")}>
            {t("nav.onlinePuja", "Online Puja Booking")}
          </li>
          <li className="nav-item text-white cursor-pointer" onClick={() => handleClick(3, "kundali")}>
            {t("nav.kundali", "Kundali")}
          </li>
          <li className="nav-item text-white cursor-pointer" onClick={() => handleClick(4, "about-mandir")}>
            {t("nav.aboutMandir", "About Mandir")}
          </li>
          <li className="nav-item text-white cursor-pointer" onClick={() => handleClick(5, "contact")}>
            {t("nav.contact", "Contact")}
          </li>
          <li>
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-white font-bold bg-gradient-to-r from-[#7c2d12] via-[#9a3412] to-[#c2410c] shadow-lg mt-2 relative" onClick={goToShop}>
              <FaShoppingCart />
              {t("nav.cart", "Cart")}
              <span className="absolute top-1 right-4 bg-yellow-300 text-red-900 text-xs px-2 py-1 rounded-full">{cartCount}</span>
            </button>
          </li>
          <li>
            {user ? (
              <div className="mobile-account-card">
                <div className="mobile-account-header">
                  <span className="header-profile-avatar">{profileInitials}</span>
                  <div className="mobile-account-copy">
                    <strong>{profileLabel}</strong>
                    <small>{user.email}</small>
                  </div>
                </div>
                <button type="button" className="mobile-account-btn" onClick={openAccountPage}>
                  <FaUser />
                  {t("nav.myAccount", "My Account")}
                </button>
                <button type="button" className="mobile-account-btn" onClick={() => openAccountSection("#track-order")}>
                  <FaUser />
                  {t("account.trackOrderTitle", "Track Order")}
                </button>
                <button type="button" className="mobile-account-btn" onClick={() => openAccountSection("#order-history")}>
                  <FaUser />
                  {t("account.orderHistoryTitle", "Order History")}
                </button>
                <button type="button" className="mobile-account-btn" onClick={() => openAccountSection("#temple-donation-history")}>
                  <FaUser />
                  {t("account.donationHistoryLabel", "Donation History")}
                </button>
                <button type="button" className="mobile-account-btn" onClick={() => openAccountSection("#puja-history")}>
                  <FaUser />
                  {t("account.pujaHistoryTitle", "Puja History")}
                </button>
                <button type="button" className="mobile-account-btn" onClick={() => openAccountSection("#temple-donation-history")}>
                  <FaUser />
                  {t("account.donationHistoryTitle", "Temple Donation History")}
                </button>
                <button type="button" className="header-profile-menu-item" onClick={handleLogout}>
                  <FaRightFromBracket />
                  {t("nav.logout", "Logout")}
                </button>
              </div>
            ) : !loading ? (
              <button type="button" className="header-login-btn header-login-btn-mobile" onClick={openLoginPage}>
                <FaUserCircle />
                Login
              </button>
            ) : null}
          </li>
          <li>
            <button
              type="button"
              className="w-full py-3 rounded-full text-white font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-lg"
              onClick={() => {
                setOpen(false);
                onOpenDonation?.();
              }}
            >
              {t("nav.donate", "Donate")}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
