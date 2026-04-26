import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    UtensilsCrossed,
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    MapPin,
    Phone,
    Search,
    Star,
    Loader2,
    AlertTriangle,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const emptyForm = {
    place_id: '',
    name: '',
    address: '',
    phone_number: '',
    rating: '',
    rating_count: '',
    cuisine_type: '',
    photo_url: '',
    latitude: '',
    longitude: '',
    google_maps_url: '',
    is_active: true,
    sort_order: 0,
};

function StarRating({ rating, count }) {
    if (rating == null) return null;
    const value = Number(rating);
    const full = Math.floor(value);
    const half = value - full >= 0.25 && value - full < 0.75;
    const stars = Array.from({ length: 5 }, (_, i) => {
        if (i < full) return 'full';
        if (i === full && half) return 'half';
        return 'empty';
    });
    return (
        <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-700">{value.toFixed(1)}</span>
            <div className="flex">
                {stars.map((s, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={
                            s === 'full'
                                ? 'fill-amber-400 text-amber-400'
                                : s === 'half'
                                ? 'fill-amber-400/50 text-amber-400'
                                : 'fill-gray-200 text-gray-200'
                        }
                    />
                ))}
            </div>
            {count != null && (
                <span className="text-xs text-gray-500">({Number(count).toLocaleString()})</span>
            )}
        </div>
    );
}

function GooglePreviewCard({ data }) {
    if (!data.name) return null;
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 flex gap-3">
            {data.photo_url ? (
                <img
                    src={data.photo_url}
                    alt={data.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed size={24} className="text-gray-400" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 dark:text-white truncate">{data.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={data.rating} count={data.rating_count} />
                    {data.cuisine_type && (
                        <>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">{data.cuisine_type}</span>
                        </>
                    )}
                </div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{data.address}</div>
            </div>
        </div>
    );
}

function GoogleSearchInput({ enabled, value, onChange, onSelect }) {
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = (q) => {
        if (!enabled) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            if (q.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${route('admin.halal-restaurants.autocomplete')}?q=${encodeURIComponent(q)}`,
                    { headers: { Accept: 'application/json' } }
                );
                const json = await res.json();
                if (!res.ok) {
                    setError(json.error || 'Search failed.');
                    setSuggestions([]);
                } else {
                    setSuggestions(json.suggestions || []);
                }
            } catch (e) {
                setError('Network error.');
            } finally {
                setLoading(false);
            }
        }, 350);
    };

    const handleChange = (e) => {
        const v = e.target.value;
        onChange(v);
        setOpen(true);
        fetchSuggestions(v);
    };

    const handleSelect = async (suggestion) => {
        setOpen(false);
        setSuggestions([]);
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${route('admin.halal-restaurants.place-details')}?place_id=${encodeURIComponent(suggestion.place_id)}`,
                { headers: { Accept: 'application/json' } }
            );
            const json = await res.json();
            if (!res.ok) {
                setError(json.error || 'Could not load place details.');
            } else {
                onSelect(json.place);
            }
        } catch (e) {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder={enabled ? 'Search Google Maps for restaurant...' : 'Type restaurant name'}
                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm pl-10 pr-10 py-3"
                />
                {loading && (
                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                )}
            </div>

            {open && enabled && (suggestions.length > 0 || error) && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#0c0c0c] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 max-h-72 overflow-y-auto z-10">
                    {error && (
                        <div className="px-4 py-3 text-xs text-red-500 flex items-center gap-2">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}
                    {suggestions.map((s) => (
                        <button
                            key={s.place_id}
                            type="button"
                            onClick={() => handleSelect(s)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b last:border-b-0 border-gray-50 dark:border-white/5"
                        >
                            <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                {s.primary_text}
                            </div>
                            {s.secondary_text && (
                                <div className="text-xs text-gray-500 truncate">{s.secondary_text}</div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function RestaurantForm({ data, setData, errors, googlePlacesEnabled, isCreate }) {
    const fillFromPlace = (place) => {
        setData({
            ...data,
            place_id: place.place_id || '',
            name: place.name || data.name,
            address: place.address || data.address,
            phone_number: place.phone_number || data.phone_number,
            rating: place.rating ?? '',
            rating_count: place.rating_count ?? '',
            cuisine_type: place.cuisine_type || '',
            photo_url: place.photo_url || '',
            latitude: place.latitude ?? '',
            longitude: place.longitude ?? '',
            google_maps_url: place.google_maps_url || '',
        });
    };

    const clearGoogle = () => {
        setData({
            ...data,
            place_id: '',
            rating: '',
            rating_count: '',
            cuisine_type: '',
            photo_url: '',
            latitude: '',
            longitude: '',
            google_maps_url: '',
        });
    };

    return (
        <div className="space-y-4">
            {!googlePlacesEnabled && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>
                        Google Places search is disabled. Set <code className="font-mono">GOOGLE_PLACES_API_KEY</code> in <code className="font-mono">.env</code> to enable autocomplete.
                    </span>
                </div>
            )}

            <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block">
                    {isCreate ? 'Search Google Maps *' : 'Restaurant Name *'}
                </label>
                <GoogleSearchInput
                    enabled={googlePlacesEnabled}
                    value={data.name}
                    onChange={(v) => setData({ ...data, name: v })}
                    onSelect={fillFromPlace}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {(data.photo_url || data.rating || data.cuisine_type) && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500">Google Preview</label>
                        <button
                            type="button"
                            onClick={clearGoogle}
                            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                        >
                            <X size={12} /> Clear Google data
                        </button>
                    </div>
                    <GooglePreviewCard data={data} />
                </div>
            )}

            <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block">Address *</label>
                <textarea
                    value={data.address}
                    onChange={(e) => setData({ ...data, address: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3"
                    rows={2}
                    placeholder="Street, area"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block">Phone Number</label>
                <input
                    type="text"
                    value={data.phone_number}
                    onChange={(e) => setData({ ...data, phone_number: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                    placeholder="012-3456789"
                />
                {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">Sort Order</label>
                    <input
                        type="number"
                        value={data.sort_order}
                        onChange={(e) => setData({ ...data, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                        min="0"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">Status</label>
                    <button
                        type="button"
                        onClick={() => setData({ ...data, is_active: !data.is_active })}
                        className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors ${
                            data.is_active
                                ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-200 dark:border-green-500/20'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/10'
                        }`}
                    >
                        {data.is_active ? (
                            <>
                                <Eye size={14} /> Active
                            </>
                        ) : (
                            <>
                                <EyeOff size={14} /> Inactive
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function HalalRestaurants({ restaurants, googlePlacesEnabled }) {
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const [createData, setCreateData] = useState(emptyForm);
    const [editData, setEditData] = useState(emptyForm);
    const [createErrors, setCreateErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});

    const handleCreate = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.halal-restaurants.store'), createData, {
            onSuccess: () => {
                setCreating(false);
                setCreateData(emptyForm);
                setCreateErrors({});
            },
            onError: (errs) => setCreateErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.halal-restaurants.update', editing.id), editData, {
            onSuccess: () => {
                setEditing(null);
                setEditData(emptyForm);
                setEditErrors({});
            },
            onError: (errs) => setEditErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.halal-restaurants.destroy', id), {
            onSuccess: () => setDeleting(null),
        });
    };

    const openEdit = (r) => {
        setEditing(r);
        setEditData({
            place_id: r.place_id || '',
            name: r.name || '',
            address: r.address || '',
            phone_number: r.phone_number || '',
            rating: r.rating ?? '',
            rating_count: r.rating_count ?? '',
            cuisine_type: r.cuisine_type || '',
            photo_url: r.photo_url || '',
            latitude: r.latitude ?? '',
            longitude: r.longitude ?? '',
            google_maps_url: r.google_maps_url || '',
            is_active: r.is_active,
            sort_order: r.sort_order,
        });
        setEditErrors({});
    };

    const activeCount = restaurants.filter((r) => r.is_active).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            Halal <span className="text-[#FF6600]">Restaurants</span>
                        </h2>
                        <p className="text-gray-400 text-sm font-semibold">
                            Manage halal restaurant listings in Penang.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setCreating(true);
                            setCreateErrors({});
                            setCreateData(emptyForm);
                        }}
                        className="btn-gradient px-6 py-3 text-xs font-black rounded-xl flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Restaurant
                    </button>
                </div>
            }
        >
            <Head title="Halal Restaurants" />

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <UtensilsCrossed size={20} className="text-[#FF6600]" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{restaurants.length}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Total Restaurants
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <Eye size={20} className="text-green-500" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{activeCount}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Active Listings
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {restaurants.map((r) => (
                    <div
                        key={r.id}
                        className="bg-white dark:bg-[#0c0c0c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 flex gap-4"
                    >
                        {r.photo_url ? (
                            <img
                                src={r.photo_url}
                                alt={r.name}
                                className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                                <UtensilsCrossed size={28} className="text-gray-300" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{r.name}</h3>
                                        <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                r.is_active
                                                    ? 'bg-green-50 dark:bg-green-500/10 text-green-600'
                                                    : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                                            }`}
                                        >
                                            {r.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {r.rating != null && <StarRating rating={r.rating} count={r.rating_count} />}
                                        {r.cuisine_type && (
                                            <>
                                                <span className="text-gray-300">·</span>
                                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                                    {r.cuisine_type}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-1 mt-2 text-xs text-gray-500">
                                        <MapPin size={12} className="text-gray-300 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">{r.address}</span>
                                    </div>
                                    {r.phone_number && (
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                            <Phone size={12} className="text-gray-300" />
                                            {r.phone_number}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <button
                                        onClick={() => openEdit(r)}
                                        className="px-3 py-1 text-[11px] font-bold text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-lg flex items-center gap-1"
                                    >
                                        <Pencil size={11} /> Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleting(r)}
                                        className="px-3 py-1 text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center gap-1"
                                    >
                                        <Trash2 size={11} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {restaurants.length === 0 && (
                    <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-8 text-center text-gray-400 text-sm">
                        No restaurants yet. Click "Add Restaurant" to add one.
                    </div>
                )}
            </div>

            {creating && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setCreating(false)}
                >
                    <div
                        className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">New Restaurant</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <RestaurantForm
                                data={createData}
                                setData={setCreateData}
                                errors={createErrors}
                                googlePlacesEnabled={googlePlacesEnabled}
                                isCreate={true}
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCreating(false)}
                                    className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 btn-gradient py-3 text-xs font-black rounded-xl"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editing && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setEditing(null)}
                >
                    <div
                        className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Edit Restaurant</h3>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <RestaurantForm
                                data={editData}
                                setData={setEditData}
                                errors={editErrors}
                                googlePlacesEnabled={googlePlacesEnabled}
                                isCreate={false}
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditing(null)}
                                    className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 btn-gradient py-3 text-xs font-black rounded-xl"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleting && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setDeleting(null)}
                >
                    <div
                        className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-black text-red-600 mb-3">Delete Restaurant</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Are you sure you want to delete "{deleting.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleting(null)}
                                className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleting.id)}
                                className="flex-1 py-3 text-xs font-black text-white bg-red-500 rounded-xl hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
