import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createListing, fetchListingById, updateListing } from '../api/listingsApi';
import { useAuth } from '../context/AuthContext';

const categories = [
  'Electronics',
  'Vehicles',
  'Home and Garden',
  'Clothing',
  'Sports',
  'Collectibles',
  'Other',
];

const conditions = ['New', 'Like New', 'Used - Good', 'Used - Fair'];

// Category-specific extra fields shown below the main form fields
const categoryFields = {
  Vehicles: [
    { name: 'year', label: 'Year', type: 'number', placeholder: '2020', col: 'col-md-3' },
    { name: 'make', label: 'Make', type: 'text', placeholder: 'Toyota', col: 'col-md-3' },
    { name: 'model', label: 'Model', type: 'text', placeholder: 'Camry', col: 'col-md-3' },
    { name: 'colour', label: 'Colour', type: 'text', placeholder: 'Silver', col: 'col-md-3' },
    { name: 'mileage', label: 'Mileage (km)', type: 'number', placeholder: '75000', col: 'col-md-4' },
    { name: 'transmission', label: 'Transmission', type: 'select', options: ['', 'Automatic', 'Manual', 'CVT'], col: 'col-md-4' },
    { name: 'fuelType', label: 'Fuel Type', type: 'select', options: ['', 'Gasoline', 'Diesel', 'Electric', 'Hybrid'], col: 'col-md-4' },
  ],
  Electronics: [
    { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Apple', col: 'col-md-4' },
    { name: 'model', label: 'Model', type: 'text', placeholder: 'iPhone 14 Pro', col: 'col-md-4' },
    { name: 'storageCapacity', label: 'Storage / Capacity', type: 'text', placeholder: '256 GB', col: 'col-md-4' },
    { name: 'screenSize', label: 'Screen Size', type: 'text', placeholder: '6.1"', col: 'col-md-4' },
  ],
  'Home and Garden': [
    { name: 'material', label: 'Material', type: 'text', placeholder: 'Wood, Metal…', col: 'col-md-4' },
    { name: 'dimensions', label: 'Dimensions', type: 'text', placeholder: '60" × 30" × 36"', col: 'col-md-4' },
    { name: 'roomType', label: 'Room / Area', type: 'text', placeholder: 'Living Room, Garden…', col: 'col-md-4' },
  ],
  Clothing: [
    { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Nike', col: 'col-md-3' },
    { name: 'size', label: 'Size', type: 'text', placeholder: 'M / 32×32…', col: 'col-md-3' },
    { name: 'colour', label: 'Colour', type: 'text', placeholder: 'Black', col: 'col-md-3' },
    { name: 'gender', label: 'For', type: 'select', options: ['', 'Men', 'Women', 'Unisex', 'Kids'], col: 'col-md-3' },
  ],
  Sports: [
    { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Adidas', col: 'col-md-4' },
    { name: 'sportType', label: 'Sport', type: 'text', placeholder: 'Soccer, Basketball…', col: 'col-md-4' },
    { name: 'size', label: 'Size', type: 'text', placeholder: 'Medium / 10…', col: 'col-md-4' },
  ],
  Collectibles: [
    { name: 'era', label: 'Era / Year', type: 'text', placeholder: '1980s', col: 'col-md-4' },
    { name: 'brand', label: 'Brand / Maker', type: 'text', placeholder: 'Marvel, Hasbro…', col: 'col-md-4' },
    { name: 'material', label: 'Material', type: 'text', placeholder: 'Metal, Plastic…', col: 'col-md-4' },
  ],
};

const allowedImageTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const allowedVideoTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const allowedImageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const allowedVideoExtensions = new Set(['mp4', 'webm', 'mov']);
const maxMediaCount = 8;
const maxImageBytes = 3 * 1024 * 1024;
const maxVideoBytes = 10 * 1024 * 1024;

const isVideoDataUrl = (url) => url && url.startsWith('data:video/');

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
  reader.readAsDataURL(file);
});

const initialForm = {
  title: '',
  description: '',
  price: '',
  category: '',
  condition: '',
  address: '',
  city: '',
  province: 'ON',
  postalCode: '',
  expiryDate: '',
};

export default function CreateListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [categoryDetails, setCategoryDetails] = useState({});
  const [media, setMedia] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditMode) return undefined;

    let cancelled = false;
    setLoading(true);
    setLoadError('');

    fetchListingById(id)
      .then((response) => {
        if (cancelled) return;

        const listing = response.data;
        const ownerId = listing.owner?._id || listing.owner;
        if (!user?.id || String(ownerId) !== String(user.id)) {
          setLoadError('You can only edit listings that you posted.');
          return;
        }

        setForm({
          title: listing.title || '',
          description: listing.description || '',
          price: listing.price ?? '',
          category: listing.category || '',
          condition: listing.condition || '',
          address: listing.location?.address || '',
          city: listing.location?.city || '',
          province: listing.location?.province || 'ON',
          postalCode: listing.location?.postalCode || '',
          expiryDate: listing.expiryDate ? String(listing.expiryDate).slice(0, 10) : '',
        });
        setCategoryDetails(listing.categoryDetails || {});
        setMedia(
          (listing.images || []).map((dataUrl, index) => ({
            id: `existing-${index}`,
            name: isVideoDataUrl(dataUrl) ? `Existing video ${index + 1}` : `Existing photo ${index + 1}`,
            dataUrl,
            isVideo: isVideoDataUrl(dataUrl),
          }))
        );
      })
      .catch((requestError) => {
        if (cancelled) return;
        setLoadError(
          requestError.response?.status === 404
            ? 'This listing could not be found.'
            : 'Unable to load this listing for editing. Please try again.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, user?.id]);

  const update = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
    if (target.name === 'category') setCategoryDetails({});
    if (error) setError('');
  };

  const updateCategoryDetail = ({ target }) => {
    setCategoryDetails((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleMedia = async ({ target }) => {
    const files = Array.from(target.files || []);
    target.value = '';
    setMediaError('');

    if (media.length + files.length > maxMediaCount) {
      setMediaError(`You can attach up to ${maxMediaCount} photos or videos.`);
      return;
    }

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isImage = allowedImageTypes.has(file.type.toLowerCase()) && allowedImageExtensions.has(ext);
      const isVideo = allowedVideoTypes.has(file.type.toLowerCase()) && allowedVideoExtensions.has(ext);

      if (!isImage && !isVideo) {
        setMediaError(`${file.name} is not supported. Choose a JPG, PNG, WEBP, GIF, MP4, WebM or MOV file.`);
        return;
      }

      const limit = isVideo ? maxVideoBytes : maxImageBytes;
      const label = isVideo ? '10 MB' : '3 MB';
      if (file.size > limit) {
        setMediaError(`${file.name} exceeds the ${label} limit.`);
        return;
      }
    }

    try {
      const encoded = await Promise.all(
        files.map(async (file, index) => {
          const ext = file.name.split('.').pop()?.toLowerCase();
          const isVideo = allowedVideoTypes.has(file.type.toLowerCase()) && allowedVideoExtensions.has(ext);
          return {
            id: `${Date.now()}-${index}-${file.name}-${file.size}`,
            name: file.name,
            dataUrl: await readFileAsDataUrl(file),
            isVideo,
          };
        })
      );
      setMedia((current) => [...current, ...encoded]);
    } catch (readError) {
      setMediaError(readError.message || 'A selected file could not be read.');
    }
  };

  const removeMedia = (mediaId) => {
    setMedia((current) => current.filter((item) => item.id !== mediaId));
    setMediaError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.title.trim().length < 3) {
      setError('The listing title must be at least 3 characters.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('The description must be at least 10 characters.');
      return;
    }
    if (form.price === '' || Number(form.price) < 0) {
      setError('Enter a valid price of $0 or more.');
      return;
    }
    if (!form.category || !form.condition) {
      setError('Select a category and condition.');
      return;
    }
    if (!form.address.trim() || !form.city.trim()) {
      setError('Enter the listing address and city.');
      return;
    }
    if (!/^[A-Za-z]{2}$/.test(form.province.trim())) {
      setError('Province must use a two-letter code, such as ON.');
      return;
    }

    setSubmitting(true);

    try {
      const listingData = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        location: {
          address: form.address.trim(),
          city: form.city.trim(),
          province: form.province.trim().toUpperCase(),
          postalCode: form.postalCode.trim().toUpperCase(),
        },
        images: media.map((item) => item.dataUrl),
        categoryDetails,
        expiryDate: form.expiryDate || null,
      };

      const response = isEditMode
        ? await updateListing(id, listingData)
        : await createListing(listingData);

      navigate(`/listings/${response.data._id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        (isEditMode
          ? 'Unable to save your changes. Please try again.'
          : 'Unable to post the listing. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container my-5 text-center text-muted">Loading listing…</div>;
  }

  if (loadError) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">{loadError}</div>
        <button type="button" className="btn btn-outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const extraFields = categoryFields[form.category] || [];

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 fw-bold mb-1">{isEditMode ? 'Edit listing' : 'Post a listing'}</h1>
              <p className="text-muted mb-4">
                {isEditMode
                  ? 'Update the details buyers see on your listing.'
                  : 'Share the item you want to sell with your local community.'}
              </p>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label" htmlFor="title">Title</label>
                    <input id="title" name="title" className="form-control" value={form.title} onChange={update} minLength="3" maxLength="100" required />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="description">Description</label>
                    <textarea id="description" name="description" className="form-control" rows="4" value={form.description} onChange={update} minLength="10" maxLength="600" required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" htmlFor="price">Price</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input id="price" name="price" type="number" min="0" step="0.01" className="form-control" value={form.price} onChange={update} required />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" htmlFor="category">Category</label>
                    <select id="category" name="category" className="form-select" value={form.category} onChange={update} required>
                      <option value="">Select category</option>
                      {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" htmlFor="condition">Condition</label>
                    <select id="condition" name="condition" className="form-select" value={form.condition} onChange={update} required>
                      <option value="">Select condition</option>
                      {conditions.map((cond) => <option key={cond} value={cond}>{cond}</option>)}
                    </select>
                  </div>

                  {/* Category-specific fields */}
                  {extraFields.length > 0 && (
                    <>
                      <div className="col-12 mt-3">
                        <h2 className="h6 fw-semibold text-primary mb-0">{form.category} Details</h2>
                        <hr className="mt-1 mb-0" />
                      </div>
                      {extraFields.map((field) => (
                        <div className={field.col} key={field.name}>
                          <label className="form-label" htmlFor={`cd-${field.name}`}>{field.label}</label>
                          {field.type === 'select' ? (
                            <select
                              id={`cd-${field.name}`}
                              name={field.name}
                              className="form-select"
                              value={categoryDetails[field.name] || ''}
                              onChange={updateCategoryDetail}
                            >
                              {field.options.map((opt) => (
                                <option key={opt} value={opt}>{opt || `Select ${field.label}`}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id={`cd-${field.name}`}
                              name={field.name}
                              type={field.type}
                              className="form-control"
                              placeholder={field.placeholder}
                              value={categoryDetails[field.name] || ''}
                              onChange={updateCategoryDetail}
                            />
                          )}
                        </div>
                      ))}
                    </>
                  )}

                  <div className="col-12 mt-3">
                    <h2 className="h5 fw-bold mb-0">Location</h2>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="address">Address</label>
                    <input id="address" name="address" className="form-control" value={form.address} onChange={update} required />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label" htmlFor="city">City</label>
                    <input id="city" name="city" className="form-control" value={form.city} onChange={update} required />
                  </div>

                  <div className="col-6 col-md-1">
                    <label className="form-label" htmlFor="province">Prov.</label>
                    <input id="province" name="province" className="form-control text-uppercase" value={form.province} onChange={update} minLength="2" maxLength="2" required />
                  </div>

                  <div className="col-6 col-md-2">
                    <label className="form-label" htmlFor="postalCode">Postal code</label>
                    <input id="postalCode" name="postalCode" className="form-control text-uppercase" value={form.postalCode} onChange={update} />
                  </div>

                  {/* Media upload */}
                  <div className="col-12 mt-3">
                    <h2 className="h5 fw-bold mb-2">Photos &amp; Videos</h2>
                    <div className="media-upload-zone border rounded-3 p-3 bg-light">
                      <input
                        id="listingMedia"
                        type="file"
                        className="visually-hidden"
                        accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                        multiple
                        onChange={handleMedia}
                        disabled={submitting || media.length >= maxMediaCount}
                      />
                      <label
                        className={`btn btn-outline-primary me-2 mb-2 ${submitting || media.length >= maxMediaCount ? 'disabled' : ''}`}
                        htmlFor="listingMedia"
                      >
                        📎 Add Photos / Videos
                      </label>
                      <span className="text-muted small">
                        {media.length}/{maxMediaCount} added &nbsp;·&nbsp; JPG, PNG, WEBP, GIF up to 3 MB &nbsp;·&nbsp; MP4, WebM, MOV up to 10 MB
                      </span>

                      {mediaError && <div className="text-danger small mt-2" role="alert">{mediaError}</div>}

                      {media.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          {media.map((item, idx) => (
                            <div className="listing-upload-preview-card" key={item.id}>
                              {item.isVideo ? (
                                <video
                                  className="listing-upload-preview"
                                  src={item.dataUrl}
                                  muted
                                  playsInline
                                />
                              ) : (
                                <img
                                  className="listing-upload-preview"
                                  src={item.dataUrl}
                                  alt={`Preview of ${item.name}`}
                                />
                              )}
                              {idx === 0 && (
                                <span className="listing-upload-cover-badge">Cover</span>
                              )}
                              {item.isVideo && (
                                <span className="listing-upload-video-badge">▶</span>
                              )}
                              <button
                                type="button"
                                className="listing-upload-remove"
                                onClick={() => removeMedia(item.id)}
                                aria-label={`Remove ${item.name}`}
                                disabled={submitting}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-5 mt-2">
                    <label className="form-label" htmlFor="expiryDate">Expiry date <span className="text-muted">(optional)</span></label>
                    <input id="expiryDate" name="expiryDate" type="date" className="form-control" value={form.expiryDate} onChange={update} />
                  </div>

                  <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(isEditMode ? `/listings/${id}` : -1)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                      {submitting
                        ? (isEditMode ? 'Saving…' : 'Posting…')
                        : (isEditMode ? 'Save Changes' : 'Post Listing')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


const categories = [
  'Electronics',
  'Vehicles',
  'Home and Garden',
  'Clothing',
  'Sports',
  'Collectibles',
  'Other',
];

const conditions = ['New', 'Like New', 'Used - Good', 'Used - Fair'];
const allowedImageTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const allowedImageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const maxImageCount = 3;
const maxImageBytes = 3 * 1024 * 1024;

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
  reader.readAsDataURL(file);
});

const initialForm = {
  title: '',
  description: '',
  price: '',
  category: '',
  condition: '',
  address: '',
  city: '',
  province: 'ON',
  postalCode: '',
  expiryDate: '',
};

export default function CreateListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditMode) return undefined;

    let cancelled = false;
    setLoading(true);
    setLoadError('');

    fetchListingById(id)
      .then((response) => {
        if (cancelled) return;

        const listing = response.data;
        const ownerId = listing.owner?._id || listing.owner;
        if (!user?.id || String(ownerId) !== String(user.id)) {
          setLoadError('You can only edit listings that you posted.');
          return;
        }

        setForm({
          title: listing.title || '',
          description: listing.description || '',
          price: listing.price ?? '',
          category: listing.category || '',
          condition: listing.condition || '',
          address: listing.location?.address || '',
          city: listing.location?.city || '',
          province: listing.location?.province || 'ON',
          postalCode: listing.location?.postalCode || '',
          expiryDate: listing.expiryDate ? String(listing.expiryDate).slice(0, 10) : '',
        });
        setImages(
          (listing.images || []).map((dataUrl, index) => ({
            id: `existing-${index}`,
            name: `Existing photo ${index + 1}`,
            dataUrl,
          }))
        );
      })
      .catch((requestError) => {
        if (cancelled) return;
        setLoadError(
          requestError.response?.status === 404
            ? 'This listing could not be found.'
            : 'Unable to load this listing for editing. Please try again.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, user?.id]);

  const update = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
    if (error) setError('');
  };

  const handleImages = async ({ target }) => {
    const files = Array.from(target.files || []);
    target.value = '';
    setImageError('');

    if (images.length + files.length > maxImageCount) {
      setImageError(`You can attach up to ${maxImageCount} photos.`);
      return;
    }

    const invalidType = files.find((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return !allowedImageTypes.has(file.type.toLowerCase()) || !allowedImageExtensions.has(extension);
    });

    if (invalidType) {
      setImageError(`${invalidType.name} is not supported. Choose a JPG, JPEG, PNG, WEBP or GIF photo.`);
      return;
    }

    const oversized = files.find((file) => file.size > maxImageBytes);
    if (oversized) {
      setImageError(`${oversized.name} is larger than 3 MB.`);
      return;
    }

    try {
      const encodedImages = await Promise.all(
        files.map(async (file, index) => ({
          id: `${Date.now()}-${index}-${file.name}-${file.size}`,
          name: file.name,
          dataUrl: await readFileAsDataUrl(file),
        }))
      );
      setImages((current) => [...current, ...encodedImages]);
    } catch (readError) {
      setImageError(readError.message || 'A selected photo could not be read.');
    }
  };

  const removeImage = (imageId) => {
    setImages((current) => current.filter((image) => image.id !== imageId));
    setImageError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.title.trim().length < 3) {
      setError('The listing title must be at least 3 characters.');
      return;
    }

    if (form.description.trim().length < 10) {
      setError('The description must be at least 10 characters.');
      return;
    }

    if (form.price === '' || Number(form.price) < 0) {
      setError('Enter a valid price of $0 or more.');
      return;
    }

    if (!form.category || !form.condition) {
      setError('Select a category and condition.');
      return;
    }

    if (!form.address.trim() || !form.city.trim()) {
      setError('Enter the listing address and city.');
      return;
    }

    if (!/^[A-Za-z]{2}$/.test(form.province.trim())) {
      setError('Province must use a two-letter code, such as ON.');
      return;
    }

    setSubmitting(true);

    try {
      const listingData = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        location: {
          address: form.address.trim(),
          city: form.city.trim(),
          province: form.province.trim().toUpperCase(),
          postalCode: form.postalCode.trim().toUpperCase(),
        },
        images: images.map((image) => image.dataUrl),
        expiryDate: form.expiryDate || null,
      };

      const response = isEditMode
        ? await updateListing(id, listingData)
        : await createListing(listingData);

      navigate(`/listings/${response.data._id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        (isEditMode
          ? 'Unable to save your changes. Please try again.'
          : 'Unable to post the listing. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container my-5 text-center text-muted">Loading listing…</div>;
  }

  if (loadError) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">{loadError}</div>
        <button type="button" className="btn btn-outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 fw-bold mb-1">{isEditMode ? 'Edit listing' : 'Post a listing'}</h1>
              <p className="text-muted mb-4">
                {isEditMode
                  ? 'Update the details buyers see on your listing.'
                  : 'Share the item you want to sell with your local community.'}
              </p>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label" htmlFor="title">Title</label>
                    <input id="title" name="title" className="form-control" value={form.title} onChange={update} minLength="3" maxLength="100" required />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="description">Description</label>
                    <textarea id="description" name="description" className="form-control" rows="5" value={form.description} onChange={update} minLength="10" maxLength="600" required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" htmlFor="price">Price</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input id="price" name="price" type="number" min="0" step="0.01" className="form-control" value={form.price} onChange={update} required />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" htmlFor="category">Category</label>
                    <select id="category" name="category" className="form-select" value={form.category} onChange={update} required>
                      <option value="">Select category</option>
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" htmlFor="condition">Condition</label>
                    <select id="condition" name="condition" className="form-select" value={form.condition} onChange={update} required>
                      <option value="">Select condition</option>
                      {conditions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
                    </select>
                  </div>

                  <div className="col-12 mt-4">
                    <h2 className="h5 fw-bold mb-0">Location</h2>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="address">Address</label>
                    <input id="address" name="address" className="form-control" value={form.address} onChange={update} required />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label" htmlFor="city">City</label>
                    <input id="city" name="city" className="form-control" value={form.city} onChange={update} required />
                  </div>

                  <div className="col-6 col-md-1">
                    <label className="form-label" htmlFor="province">Province</label>
                    <input id="province" name="province" className="form-control text-uppercase" value={form.province} onChange={update} minLength="2" maxLength="2" required />
                  </div>

                  <div className="col-6 col-md-2">
                    <label className="form-label" htmlFor="postalCode">Postal code</label>
                    <input id="postalCode" name="postalCode" className="form-control text-uppercase" value={form.postalCode} onChange={update} />
                  </div>

                  <div className="col-md-7 mt-4">
                    <span className="form-label d-block">Photos <span className="text-muted">(optional)</span></span>
                    <input
                      id="listingImages"
                      type="file"
                      className="visually-hidden"
                      accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      multiple
                      onChange={handleImages}
                      disabled={submitting || images.length >= maxImageCount}
                    />
                    <label
                      className={`btn btn-outline-primary ${submitting || images.length >= maxImageCount ? 'disabled' : ''}`}
                      htmlFor="listingImages"
                    >
                      📎 Attach Photos
                    </label>
                    <div className="form-text">JPG, PNG, WEBP or GIF · up to 3 MB each · maximum 3 photos.</div>
                    {imageError && <div className="text-danger small mt-2" role="alert">{imageError}</div>}

                    {images.length > 0 && (
                      <div className="d-flex flex-wrap gap-3 mt-3">
                        {images.map((image) => (
                          <div className="listing-upload-preview-card" key={image.id}>
                            <img className="listing-upload-preview" src={image.dataUrl} alt={`Preview of ${image.name}`} />
                            <button
                              type="button"
                              className="listing-upload-remove"
                              onClick={() => removeImage(image.id)}
                              aria-label={`Remove ${image.name}`}
                              disabled={submitting}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-md-5 mt-4">
                    <label className="form-label" htmlFor="expiryDate">Expiry date <span className="text-muted">(optional)</span></label>
                    <input id="expiryDate" name="expiryDate" type="date" className="form-control" value={form.expiryDate} onChange={update} />
                  </div>

                  <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(isEditMode ? `/listings/${id}` : -1)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                      {submitting
                        ? (isEditMode ? 'Saving…' : 'Posting…')
                        : (isEditMode ? 'Save Changes' : 'Post Listing')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
