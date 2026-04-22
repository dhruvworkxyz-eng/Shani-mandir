import { useLanguage } from "../context/LanguageContext";

const topBarItems = [
  "Email Address: Shanimandiralipur@gmail.com",
  "Temple Open Time: Morning 6 - Evening 9",
  "Contact Number: +91-9911921125",
];

const TopBar = () => {
  const { t } = useLanguage();
  const marqueeItems = [
    t("topbar.email", topBarItems[0]),
    t("topbar.templeTime", topBarItems[1]),
    t("topbar.contact", topBarItems[2]),
  ];
  const repeatedItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="topbar" aria-label="Temple information bar">
      <div className="topbar-shine"></div>
      <div className="topbar-track">
        {repeatedItems.map((item, index) => (
          <span key={`${item}-${index}`} className="topbar-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TopBar;
