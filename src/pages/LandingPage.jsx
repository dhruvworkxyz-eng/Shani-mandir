import React from "react";
import "../App.css";
import devi from "../images/devii.png";
import toranLeft from "../images/Toran-left.svg";
import toranRight from "../images/Toran-right.svg";
import chakraArt from "../images/chakra.svg";
import brassDiya from "../images/brass-diya.jpg";
import copperKalash from "../images/Copper Kalash For Pooja.jpg";
import rudraksha from "../images/5 Mukhi Rudraksha.jpg";
import { useLanguage } from "../context/LanguageContext";

const LandingPage = ({ id, onFeatureProductClick }) => {
  const { t } = useLanguage();

  const openWhatsAppConsultation = () => {
    const message = encodeURIComponent(t("landing.waConsult"));
    window.open(`https://wa.me/919911921125?text=${message}`, "_blank", "noopener,noreferrer");
  };

  const openWhatsAppKundaliMilan = () => {
    const message = encodeURIComponent(t("landing.waMilan"));
    window.open(`https://wa.me/919911921125?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div id={id} className="h-[75vh] md:h-[85vh] w-full relative overflow-hidden bg-[#fcf0d8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,190,80,0.18),_transparent_55%)]"></div>
      <div
        className="absolute top-[75px] left-0 md:h-[450px] w-[50vw] bg-no-repeat bg-left bg-contain sm:h-[250px] xs:h-[250px] animate-slideInLeft"
        style={{ backgroundImage: `url(${toranLeft})` }}
      ></div>
      <div
        className="absolute top-[75px] right-0 md:h-[450px] w-[50vw] bg-no-repeat bg-right bg-contain sm:h-[250px] xs:h-[250px] animate-slideInRight"
        style={{ backgroundImage: `url(${toranRight})` }}
      ></div>

      <div className="absolute top-[105px] left-1/2 -translate-x-1/2 z-40 text-center px-4 md:top-[112px]">
        <h3
          className="templename font-extrabold tracking-wide"
          style={{
            fontSize: "clamp(2rem, 4vw, 3.4rem)",
            lineHeight: "1.2",
            background:
              "linear-gradient(90deg, rgba(255,210,120,1) 0%, rgba(252,187,88,1) 25%, rgba(244,119,40,1) 65%, rgba(180,70,15,1) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 6px 25px rgba(255,140,0,0.18)",
          }}
        >
          
          {t("landing.welcome", "Welcome to Shani Dham Mandir")}
        </h3>
        <p className="mt-1 text-[#7a3e00] text-sm md:text-base font-medium tracking-wide">
          {t("landing.tagline", "Divine Blessings • Peace • Protection")}
        </p>
      </div>

      <div className="absolute chakra md:top-[40%] md:left-[20%] md:h-28 md:w-28 opacity-30 animate-spin-slow xs:left-[10%] xs:h-20 xs:w-20 xs:top-[45%]"></div>
      <div className="absolute chakra md:top-[40%] md:right-[20%] md:h-28 md:w-28 opacity-30 animate-spin-slow xs:right-[10%] xs:h-20 xs:w-20 xs:top-[30%]"></div>
      <div className="absolute chakra top-0 left-[-50px] md:h-40 md:w-40 opacity-40 animate-spin-slow xs:h-32 xs:w-32"></div>
      <div className="absolute chakra top-0 right-[-50px] md:h-80 md:w-80 opacity-40 animate-spin-slow xs:h-32 xs:w-32"></div>
      <div className="absolute base bottom-0 w-full h-24" style={{ backgroundSize: "contain" }}></div>
      <div
        className="absolute aasan md:left-[53%] bottom-[95px] w-[700px] h-[240px] transform -translate-x-1/2 xs:h-[200px] xs:w-[400px] xs:bottom-[62px] xs:left-1/2 md:w-[695px] md:h-[240px] md:bottom-[95px]"
        style={{ backgroundSize: "contain", backgroundRepeat: "no-repeat" }}
      ></div>

      <div className="absolute top-[25%] left-1/2 -translate-x-[45%] z-0">
        <div className="middle_chakra chakra animate-spin-slow md:h-48 md:w-48 h-36 w-36 opacity-90"></div>
      </div>

      <div
        className="absolute md:bottom-[-8px] md:left-[36.5%] md:h-[650px] md:w-[820px] z-10 animate-slideInUp xs:h-[130px] xs:w-[150px] xs:bottom-8 xs:left-[20%]"
        style={{
          backgroundImage: `url(${devi})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <div className="hero-kundali-card">
        <div className="hero-kundali-visual">
          <div className="hero-kundali-halo"></div>
          <img src={chakraArt} alt="Janam Kundali graphic" className="hero-kundali-image" />
        </div>
        <div className="hero-kundali-copy">
          <p className="hero-kundali-kicker">{t("landing.kundali", "Janam Kundali")}</p>
          <h3>{t("landing.consultTitle", "Book Consultation for Kundali Guidance and Matching")}</h3>
          <span>{t("landing.consultText")}</span>
          <div className="hero-kundali-actions">
            <button type="button" className="hero-kundali-btn" onClick={openWhatsAppConsultation}>
              {t("landing.bookConsultation", "Book Consultation")}
            </button>
            <button type="button" className="hero-kundali-btn hero-kundali-btn-secondary" onClick={openWhatsAppKundaliMilan}>
              {t("landing.kundaliMilan", "Kundali Milan")}
            </button>
          </div>
        </div>
      </div>

      <div className="hero-product-cluster hero-product-cluster-left">
        <button
          type="button"
          className="hero-product-badge hero-product-badge-large hero-product-badge-button"
          onClick={() => onFeatureProductClick?.("Brass Diya")}
        >
          <img src={brassDiya} alt="Brass diya" className="hero-product-image" />
        </button>
        <button
          type="button"
          className="hero-product-badge hero-product-badge-medium hero-product-badge-button"
          onClick={() => onFeatureProductClick?.("Copper Kalash For Pooja")}
        >
          <img src={copperKalash} alt="Copper kalash" className="hero-product-image" />
        </button>
        <button
          type="button"
          className="hero-product-badge hero-product-badge-small hero-product-badge-button"
          onClick={() => onFeatureProductClick?.("Certified 5 Mukhi Rudraksha")}
        >
          <img src={rudraksha} alt="Rudraksha" className="hero-product-image" />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
