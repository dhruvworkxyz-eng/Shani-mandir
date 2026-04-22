import React, { useRef } from "react";
import { useLanguage } from "../context/LanguageContext";

const CategorySlider = ({ categories, selectedCategory, onSelectCategory }) => {
  const { translateCategory } = useLanguage();
  const sliderRef = useRef(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });

  const startDrag = (clientX) => {
    const slider = sliderRef.current;
    if (!slider) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      startX: clientX,
      scrollLeft: slider.scrollLeft,
    };
    slider.classList.add("puja-category-track-dragging");
  };

  const updateDrag = (clientX) => {
    const slider = sliderRef.current;
    const dragState = dragStateRef.current;

    if (!slider || !dragState.isDragging) {
      return;
    }

    const distance = clientX - dragState.startX;
    slider.scrollLeft = dragState.scrollLeft - distance;
  };

  const endDrag = () => {
    const slider = sliderRef.current;
    dragStateRef.current.isDragging = false;
    slider?.classList.remove("puja-category-track-dragging");
  };

  return (
    <div className="puja-category-slider">
      <div
        className="puja-category-track"
        ref={sliderRef}
        onMouseDown={(event) => startDrag(event.clientX)}
        onMouseMove={(event) => updateDrag(event.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {categories.map((category) => {
          const isActive = category.name === selectedCategory;

          return (
            <button
              key={category.name}
              type="button"
              className={isActive ? "puja-category-chip puja-category-chip-active" : "puja-category-chip"}
              onClick={() => onSelectCategory?.(category.name)}
            >
              <span className="puja-category-avatar">
                <img src={category.image} alt={translateCategory(category.name)} loading="lazy" />
              </span>
              <span className="puja-category-name">{translateCategory(category.name)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySlider;
