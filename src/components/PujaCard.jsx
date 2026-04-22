import { useLanguage } from "../context/LanguageContext";

const formatRupees = (value) => {
  try {
    return new Intl.NumberFormat("en-IN").format(value);
  } catch {
    return String(value);
  }
};

const PujaCard = ({ puja, onViewPuja, compact = false }) => {
  const { t, translateCategory } = useLanguage();

  if (!puja) return null;

  const displayTitle = puja.name || puja.title;

  const handleViewPuja = () => {
    if (typeof onViewPuja === "function") {
      onViewPuja(puja);
    }
  };

  return (
    <article
      className={compact ? "puja-card puja-card-clickable puja-card-compact" : "puja-card puja-card-clickable"}
      aria-label={displayTitle}
      onClick={handleViewPuja}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleViewPuja();
        }
      }}
    >
      <div className="puja-card-media">
        <img className="puja-card-image" src={puja.image} alt={displayTitle} loading="lazy" />
        <div className="puja-card-overlay"></div>
        {puja.badge ? <span className="puja-card-badge">{puja.badge}</span> : null}
      </div>

      <div className="puja-card-body">
        <div className="puja-card-topline">
          <span className="puja-card-category">{translateCategory(puja.category)}</span>
          <span className="puja-card-date">{puja.date}</span>
        </div>

        <h3 className="puja-card-title">{displayTitle}</h3>
        <p className="puja-card-meta">{puja.temple}</p>

        <div className="puja-card-row">
          <span className="puja-card-price">
            {t("puja.from")} <strong>Rs. {formatRupees(puja.price)}</strong>
          </span>
          <button
            type="button"
            className="puja-card-cta"
            onClick={(event) => {
              event.stopPropagation();
              handleViewPuja();
            }}
          >
            {t("puja.viewDetails")}
          </button>
        </div>
      </div>
    </article>
  );
};

export default PujaCard;
