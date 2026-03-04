import { Link } from 'react-router-dom';

const ELECTRICITY_LABELS = {
  token: 'Token',
  fixed: 'Fixed',
  included: 'Included',
  shared: 'Shared',
};

export default function HouseCard({ house }) {
  const coverImage = house.cover_image || '/placeholder-house.jpg';

  return (
    <Link to={`/houses/${house.id}`} className="house-card">
      <div className="house-img-wrap">
        <img src={coverImage} alt={house.title} loading="lazy" />
        {house.status === 'booked' && <span className="badge-booked">Booked</span>}
        {house.is_featured && <span className="badge-featured"><i className="bi bi-star-fill me-1"></i>Featured</span>}
        {house.videos_count > 0 && (
          <span className="badge-video"><i className="bi bi-play-circle-fill me-1"></i>Video</span>
        )}
        <div className="house-img-count">
          <i className="bi bi-images me-1"></i>{house.images_count || 0}
        </div>
      </div>

      <div className="house-card-body">
        <div className="house-category-tag">{house.category?.replace('_', ' ')}</div>
        <h3 className="house-title">{house.title}</h3>
        <div className="house-location">
          <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
          <span>{house.address}</span>
        </div>

        <div className="house-features">
          {house.has_parking && <span className="feature-chip"><i className="bi bi-car-front me-1"></i>Parking</span>}
          {house.has_shower && <span className="feature-chip"><i className="bi bi-droplet me-1"></i>Shower</span>}
          {house.has_balcony && <span className="feature-chip"><i className="bi bi-building me-1"></i>Balcony</span>}
          {house.has_wifi && <span className="feature-chip"><i className="bi bi-wifi me-1"></i>WiFi</span>}
          {house.floor_number > 0 && (
            <span className="feature-chip"><i className="bi bi-ladder me-1"></i>Floor {house.floor_number}</span>
          )}
        </div>

        <div className="house-card-footer">
          <div className="house-price">
            <span className="rent-amount">KES {Number(house.rent).toLocaleString()}</span>
            <span className="rent-period">/mo</span>
          </div>
          <div className="house-elec">
            <i className="bi bi-lightning-fill text-warning me-1"></i>
            <small>{ELECTRICITY_LABELS[house.electricity] || house.electricity}</small>
          </div>
        </div>

        {house.landlord && (
          <div className="house-landlord">
            <div className="landlord-mini-avatar">
              {house.landlord.user?.avatar
                ? <img src={house.landlord.user.avatar} alt="" />
                : <span>{(house.landlord.user?.first_name || house.landlord.user?.username || 'L')[0]}</span>}
            </div>
            <span>{house.landlord.user?.first_name || house.landlord.user?.username}</span>
            {house.landlord.average_rating > 0 && (
              <span className="ms-auto landlord-rating">
                <i className="bi bi-star-fill text-warning me-1"></i>
                {Number(house.landlord.average_rating).toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}