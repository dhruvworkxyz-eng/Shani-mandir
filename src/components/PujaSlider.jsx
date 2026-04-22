import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import CategorySlider from "./CategorySlider";
import PujaList from "./PujaList";
import pujas, { pujaCategories } from "../data/pujas";
import kundaliArt from "../images/chakra.svg";
import aboutMandirVideo from "../videos/about-mandir.mp4";

const PujaSlider = ({ id, onViewPuja }) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const openWhatsAppConsultation = () => {
    const message = encodeURIComponent(t("landing.waConsult"));
    window.open(`https://wa.me/919911921125?text=${message}`, "_blank", "noopener,noreferrer");
  };

  const openWhatsAppKundaliMilan = () => {
    const message = encodeURIComponent(t("landing.waMilan"));
    window.open(`https://wa.me/919911921125?text=${message}`, "_blank", "noopener,noreferrer");
  };

  const mandirHighlights = [
    {
      number: "01",
      title: t("puja.highlights.ritualTitle"),
      description: t("puja.highlights.ritualText"),
    },
    {
      number: "02",
      title: t("puja.highlights.blessingsTitle"),
      description: t("puja.highlights.blessingsText"),
    },
    {
      number: "03",
      title: t("puja.highlights.onlineTitle"),
      description: t("puja.highlights.onlineText"),
    },
    {
      number: "04",
      title: t("puja.highlights.supportTitle"),
      description: t("puja.highlights.supportText"),
    },
  ];

  return (
    <section id={id} className="puja-section">
      <div className="puja-head">
        <div className="puja-head-inner">
          <p className="puja-kicker">{t("puja.kicker")}</p>
          <h2 className="puja-title">{t("puja.title")}</h2>
          <p className="puja-subtitle">{t("puja.subtitle")}</p>
        </div>
      </div>

      <CategorySlider
        categories={pujaCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <PujaList pujas={pujas} selectedCategory={selectedCategory} onViewPuja={onViewPuja} />

      <div id="kundali" className="kundali-consult-card">
        <div className="kundali-consult-visual">
          <div className="kundali-visual-halo"></div>
          <img src={kundaliArt} alt="Janam Kundali aesthetic artwork" className="kundali-consult-image" />
        </div>
        <div className="kundali-consult-copy">
          <p className="kundali-consult-kicker">{t("puja.kundaliKicker")}</p>
          <h3>{t("puja.kundaliTitle")}</h3>
          <span>{t("puja.kundaliText")}</span>
          <small>{t("puja.kundaliSmall")}</small>
          <div className="kundali-consult-actions">
            <button type="button" className="kundali-consult-btn" onClick={openWhatsAppConsultation}>
              {t("puja.bookConsultation")}
            </button>
            <button type="button" className="kundali-consult-btn kundali-consult-btn-secondary" onClick={openWhatsAppKundaliMilan}>
              {t("puja.kundaliMilan")}
            </button>
          </div>
        </div>
      </div>

      <div id="about-mandir" className="kundali-about-card">
        <div className="kundali-about-media">
          <video
            className="kundali-about-video"
            src={aboutMandirVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="kundali-about-media-overlay"></div>
          <div className="kundali-about-media-badge">
            <span className="kundali-about-media-kicker">Shani Dham Alipur</span>
            <strong>Seva, Shradha, Shani Kripa</strong>
          </div>
        </div>
        <div className="kundali-about-copy">
          <p className="kundali-consult-kicker">{t("puja.aboutKicker")}</p>
          <h3>{t("puja.aboutTitle")}</h3>
          <p className="kundali-about-lead">{t("puja.aboutLead")}</p>
          <div className="kundali-about-intro-card">
            <p className="kundali-about-intro-kicker">{t("puja.aboutCardKicker")}</p>
            <span>{t("puja.aboutCardText")}</span>
          </div>
          <div className="kundali-about-feature-grid">
            {mandirHighlights.map((item) => (
              <article key={item.title} className="kundali-about-feature-card">
                <div className="kundali-about-feature-icon">
                  <span>{item.number}</span>
                </div>
                <div className="kundali-about-feature-copy">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PujaSlider;
