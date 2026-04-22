import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import yt from "../assets/yt.svg";
import fb from "../assets/fb.svg";
import insta from "../assets/insta.svg";
import { useLanguage } from "../context/LanguageContext";
const Footer = () => {
  const { t } = useLanguage();
  return (

    <div
      className="flex flex-col justify-center items-center b px-8 py-3 w-full z-50 foot-main"
      style={{
        background: "#781102",
        //   borderTopLeftRadius: "30px",
        //   borderTopRightRadius: "30px",
      }}
    >
      <h3 className="text-orange-400 font-bold text-2x">{t("footer.followUs", "Follow Us")}</h3>
      <div className="flex justify-center items-center px-8 py-2 w-full z-50">
        <a
          href="https://www.instagram.com/shani_dham_mandir/"
          target="_blank"
        >
          <div className="insta"></div>
        </a>
        <a
          href="https://www.youtube.com/@shanimandiralipur"
          target="_blank"
        >
          <div className="yt"></div>
        </a>
        <a
          href="https://www.facebook.com/shanidhammandiralipur"
          target="_blank"
        >
          {" "}
          <div className="fb"></div>
        </a>
      </div>
      <div
        className="text-orange-400 font-sans px-6 py-0.5 orange-border text-center"
        style={{
          background: "#781102",
        }}
      >
        {" "}
        &copy; {t("footer.copyright", "Copyright Shani Dham Mandir, Alipur, Delhi.")}
      </div>
      <div className="foot-pattern"> </div>
    </div>
  );
};
export default Footer;
