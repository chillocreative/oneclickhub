import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, Tag, User, Briefcase, ArrowLeft, MessageCircle, Star } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import AvailabilityCalendar from '@/Components/AvailabilityCalendar';
import { useState } from 'react';

export default function ShowService({ service, relatedServices, availableDates = [], bookedDates = [], reviews = [] }) {
    const { auth } = usePage().props;
    const [selectedDate, setSelectedDate] = useState(null);

    const bookingForm = useForm({
        service_id: service.id,
        booking_date: '',
        agreed_price: service.price_from,
        customer_notes: '',
    });

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        bookingForm.setData('booking_date', date);
    };

    const handleBook = (e) => {
        e.preventDefault();
        bookingForm.post(route('orders.store'));
    };

    const handleMessage = () => {
        router.post(route('chat.start'), { user_id: service.user_id });
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#0c0c0c]">
            <Head title={service.title} />

            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden"><ApplicationLogo /></div>
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">ONECLICK<span className="text-[#FF6600]">HUB</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href={route('services.browse')} className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-[#FF6600] flex items-center gap-2">
                            <ArrowLeft size={16} /> Back to Services
                        </Link>
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="btn-gradient px-5 py-2 text-xs">Dashboard</Link>
                        ) : (
                            <Link href={route('register')} className="btn-gradient px-5 py-2 text-xs">Get Started</Link>
                        )}
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Images */}
                        <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                            <div className="h-80 md:h-[400px] bg-gradient-to-br from-[#FF6600]/10 to-[#FFB800]/10 flex items-center justify-center">
                                {service.images?.[0] ? (
                                    <img src={`/storage/${service.images[0]}`} alt={service.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Briefcase size={80} className="text-[#FF6600]/20" />
                                )}
                            </div>
                            {service.images?.length > 1 && (
                                <div className="flex gap-2 p-4 overflow-x-auto">
                                    {service.images.map((img, idx) => (
                                        <div key={idx} className="flex-none size-20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                                            <img src={`/storage/${img}`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">{service.category?.name}</span>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mt-2 mb-4">{service.title}</h1>

                            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
                                {service.delivery_days && (
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-[#FF6600]" />
                                        <span>{service.delivery_days} days delivery</span>
                                    </div>
                                )}
                                {avgRating && (
                                    <div className="flex items-center gap-2">
                                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                        <span>{avgRating} ({reviews.length} reviews)</span>
                                    </div>
                                )}
                            </div>

                            {service.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {service.tags.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-[#FF6600] text-xs font-bold flex items-center gap-1">
                                            <Tag size={10} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {service.description}
                            </div>
                        </div>

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6">Reviews</h2>
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="size-8 rounded-lg bg-gradient-to-tr from-[#FF6600] to-[#FFB800] p-[1.5px]">
                                                    <div className="size-full bg-white dark:bg-gray-900 rounded-[5px] flex items-center justify-center text-[10px] font-black text-[#FF6600]">
                                                        {review.customer?.name?.charAt(0)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black text-gray-900 dark:text-white">{review.customer?.name}</span>
                                                    <div className="flex gap-0.5">
                                                        {[1,2,3,4,5].map(n => (
                                                            <Star key={n} size={10} className={n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 sticky top-28">
                            <div className="text-center mb-6">
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Starting at</div>
                                <div className="text-4xl font-black text-[#FF6600]">
                                    RM {service.price_from}
                                    {service.price_to && (
                                        <span className="text-lg text-gray-400 font-semibold"> - RM {service.price_to}</span>
                                    )}
                                </div>
                            </div>

                            {auth?.user ? (
                                <>
                                    {/* Calendar */}
                                    <div className="mb-6">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Select Date</h3>
                                        <AvailabilityCalendar
                                            availableDates={availableDates}
                                            bookedDates={bookedDates}
                                            onSelectDate={handleSelectDate}
                                            selectedDate={selectedDate}
                                            mode="book"
                                        />
                                    </div>

                                    {/* Booking Form */}
                                    {selectedDate && (
                                        <form onSubmit={handleBook} className="space-y-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1 block">Agreed Price (RM)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={bookingForm.data.agreed_price}
                                                    onChange={e => bookingForm.setData('agreed_price', e.target.value)}
                                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1 block">Notes (optional)</label>
                                                <textarea
                                                    value={bookingForm.data.customer_notes}
                                                    onChange={e => bookingForm.setData('customer_notes', e.target.value)}
                                                    placeholder="Any special requirements..."
                                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                                                    rows={2}
                                                />
                                            </div>
                                            {bookingForm.errors.booking_date && <p className="text-red-500 text-xs">{bookingForm.errors.booking_date}</p>}
                                            <button
                                                type="submit"
                                                disabled={bookingForm.processing}
                                                className="w-full btn-gradient py-4 text-sm font-black rounded-2xl disabled:opacity-50"
                                            >
                                                {bookingForm.processing ? 'Booking...' : `Book for ${selectedDate}`}
                                            </button>
                                        </form>
                                    )}

                                    <button
                                        onClick={handleMessage}
                                        className="w-full py-4 text-sm font-black flex items-center justify-center gap-2 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                    >
                                        <MessageCircle size={18} /> Message Freelancer
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href={route('register')} className="w-full btn-gradient py-4 text-sm font-black flex items-center justify-center gap-2 rounded-2xl">
                                        Sign Up to Book
                                    </Link>
                                    <p className="text-[10px] text-gray-400 text-center mt-3 font-semibold">Create an account to book services</p>
                                </>
                            )}
                        </div>

                        {/* Freelancer Info */}
                        <div className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">About the Freelancer</h3>
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-gradient-to-tr from-[#FF6600] to-[#FFB800] p-[2px]">
                                    <div className="size-full bg-white dark:bg-gray-900 rounded-[14px] flex items-center justify-center font-black text-[#FF6600] text-lg">
                                        {service.user?.name?.charAt(0) || '?'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-black text-gray-900 dark:text-white">{service.user?.name}</div>
                                    <div className="text-xs text-gray-400 font-semibold">{service.user?.position || 'Freelancer'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Services */}
                {relatedServices.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-8">Related Services</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedServices.map((s) => (
                                <motion.div key={s.id} whileHover={{ y: -5 }}>
                                    <Link
                                        href={route('services.show', s.slug)}
                                        className="block bg-white dark:bg-[#0c0c0c] rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <div className="h-36 bg-gradient-to-br from-[#FF6600]/10 to-[#FFB800]/10 flex items-center justify-center">
                                            {s.images?.[0] ? (
                                                <img src={`/storage/${s.images[0]}`} alt={s.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Briefcase size={32} className="text-[#FF6600]/30" />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-xs font-black text-gray-900 dark:text-white line-clamp-2">{s.title}</h3>
                                            <div className="text-sm font-black text-[#FF6600] mt-2">RM {s.price_from}</div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
