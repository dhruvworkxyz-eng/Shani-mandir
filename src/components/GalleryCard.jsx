const GalleryCard = ({ item }) => {
  if (!item) return null;

  return (
    <article className="gallery-card" aria-label={item.imgAlt}>
      <img
        className="gallery-card-image"
        src={item.imgURL}
        alt={item.imgAlt}
        loading="lazy"
      />
      <div className="gallery-card-overlay"></div>
    </article>
  );
};

export default GalleryCard;

