import React, { useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import PujaCard from "./PujaCard";

const PujaList = ({ pujas, selectedCategory, onViewPuja }) => {
  const { t, translateCategory } = useLanguage();
  const filteredPujas = useMemo(
    () =>
      selectedCategory === "All"
        ? pujas
        : pujas.filter((puja) => puja.category === selectedCategory),
    [pujas, selectedCategory]
  );

  if (!filteredPujas.length) {
    return (
      <div className="puja-empty-state">
        <strong>{t("puja.noPujas")}</strong>
        <span>{t("puja.chooseAnother")}</span>
      </div>
    );
  }

  return (
    <div className="puja-list-wrap">
      <div className="puja-list-meta">
        <span>{selectedCategory === "All" ? t("puja.allServices") : translateCategory(selectedCategory)}</span>
        <strong>{filteredPujas.length} {t("puja.services")}</strong>
      </div>

      <div
        className={selectedCategory === "All" ? "puja-list-grid" : "puja-list-grid puja-list-grid-columns"}
        key={selectedCategory}
      >
        {filteredPujas.map((puja) => (
          <PujaCard
            key={puja.id}
            puja={puja}
            onViewPuja={onViewPuja}
            compact={selectedCategory !== "All"}
          />
        ))}
      </div>
    </div>
  );
};

export default PujaList;
