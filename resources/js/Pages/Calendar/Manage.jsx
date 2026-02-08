import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import AvailabilityCalendar from '@/Components/AvailabilityCalendar';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function ManageCalendar({ availabilities, bookedDates }) {
    const { t } = useLanguage();
    const availableDates = availabilities.filter(a => a.type === 'available').map(a => a.date);

    const handleToggleDate = (date) => {
        const existing = availabilities.find(a => a.date === date);

        if (existing) {
            router.delete(route('calendar.removeDate'), {
                data: { date },
                preserveScroll: true,
            });
        } else {
            router.post(route('calendar.update'), {
                dates: [{ date, type: 'available' }],
            }, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {t('calendar.title')} <span className="text-[#FF6600]">{t('calendar.titleHighlight')}</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">{t('calendar.subtitle')}</p>
                </div>
            }
        >
            <Head title="Calendar" />

            <div className="max-w-lg">
                <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                            <Calendar size={24} className="text-[#FF6600]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Availability</h3>
                            <p className="text-xs text-gray-400">{t('calendar.instructions')}</p>
                        </div>
                    </div>

                    <AvailabilityCalendar
                        availableDates={availableDates}
                        bookedDates={bookedDates}
                        onSelectDate={handleToggleDate}
                        mode="manage"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
