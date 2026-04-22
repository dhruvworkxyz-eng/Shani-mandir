import React, { useMemo, useRef } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLanguage } from "../context/LanguageContext";
import images from "../images/images";
import GalleryCard from "./GalleryCard";

const chunkIntoColumns = (items, itemsPerColumn) => {
  const columns = [];
  for (let i = 0; i < items.length; i += itemsPerColumn) {
    columns.push(items.slice(i, i + itemsPerColumn));
  }
  return columns;
};

const GallerySlider = ({ id }) => {
  const { t } = useLanguage();
  const scrollerRef = useRef(null);
  const columns = useMemo(() => chunkIntoColumns(images, 2), []);

  const scrollByColumn = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const firstColumn = scroller.querySelector(".gallery-col");
    const columnWidth = firstColumn?.getBoundingClientRect().width ?? 280;
    const gap = 8;

    scroller.scrollBy({
      left: direction * (columnWidth + gap) * 2,
      behavior: "smooth",
    });
  };

  return (
    <section id={id} className="gallery-section">
      <div className="gallery-head">
        <div>
          <p className="gallery-kicker">{t("gallery.kicker")}</p>
          <h2 className="gallery-title">{t("gallery.title")}</h2>
        </div>
        <div className="gallery-actions">
          <button
            type="button"
            className="gallery-nav"
            onClick={() => scrollByColumn(-1)}
            aria-label={t("gallery.scrollLeft")}
          >
            <ArrowBackIcon fontSize="small" />
          </button>
          <button
            type="button"
            className="gallery-nav"
            onClick={() => scrollByColumn(1)}
            aria-label={t("gallery.scrollRight")}
          >
            <ArrowForwardIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="gallery-scroller" ref={scrollerRef}>
        {columns.map((column, index) => (
          <div className="gallery-col" key={index}>
            {column.map((item, itemIndex) => (
              <GalleryCard key={`${item.imgAlt}-${itemIndex}`} item={item} />
            ))}
            {column.length === 1 ? (
              <div className="gallery-card gallery-card-ghost" aria-hidden="true"></div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export default GallerySlider;
