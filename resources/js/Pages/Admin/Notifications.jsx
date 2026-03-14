import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Bell, Send, Users, Briefcase, Globe } from 'lucide-react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function Notifications({ notifications }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        body: '',
        target_role: 'all',
    });

    const submit = (e) => {
        e.preventDefault();
        if (!confirm(`Send this notification to ${data.target_role === 'all' ? 'all users' : data.target_role + 's'}?`)) return;
        post(route('admin.notifications.send'), {
            onSuccess: () => reset(),
        });
    };

    const roleLabels = { all: 'All Users', Freelancer: 'Freelancers', Customer: 'Customers' };
    const roleIcons = { all: Globe, Freelancer: Briefcase, Customer: Users };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Push <span className="text-[#FF6600]">Notifications</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">Send push notifications to mobile app users.</p>
                </div>
            }
        >
            <Head title="Push Notifications" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Send Form */}
                <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                            <Send size={24} className="text-[#FF6600]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Send Notification</h3>
                            <p className="text-xs text-gray-400">Compose and send to mobile users</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <InputLabel value="Target Audience" />
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(roleLabels).map(([value, label]) => {
                                    const Icon = roleIcons[value];
                                    const isSelected = data.target_role === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setData('target_role', value)}
                                            className={`p-4 rounded-2xl border-2 transition-all text-center ${
                                                isSelected
                                                    ? 'border-[#FF6600] bg-orange-50 dark:bg-orange-500/10'
                                                    : 'border-gray-100 dark:border-white/5 hover:border-gray-200'
                                            }`}
                                        >
                                            <Icon size={20} className={`mx-auto mb-2 ${isSelected ? 'text-[#FF6600]' : 'text-gray-400'}`} />
                                            <span className={`text-xs font-bold ${isSelected ? 'text-[#FF6600]' : 'text-gray-500'}`}>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.target_role && <p className="text-red-500 text-xs">{errors.target_role}</p>}
                        </div>

                        <div className="space-y-2">
                            <InputLabel value="Title" />
                            <TextInput
                                className="w-full"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="e.g. New Feature Available!"
                                maxLength={255}
                            />
                            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <InputLabel value="Message" />
                            <textarea
                                className="w-full rounded-xl border-gray-300 dark:border-white/10 dark:bg-[#0c0c0c] focus:border-[#FF6600] focus:ring-[#FF6600] resize-none"
                                rows={4}
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                placeholder="Write your notification message..."
                                maxLength={1000}
                            />
                            <p className="text-xs text-gray-400 text-right">{data.body.length}/1000</p>
                            {errors.body && <p className="text-red-500 text-xs">{errors.body}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.title || !data.body}
                            className="w-full py-4 btn-gradient font-black text-sm uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Send size={16} />
                            {processing ? 'Sending...' : 'Send Notification'}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                            <Bell size={24} className="text-[#FF6600]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Notification History</h3>
                            <p className="text-xs text-gray-400">{notifications?.total ?? 0} notifications sent</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {(!notifications?.data || notifications.data.length === 0) ? (
                            <div className="text-center py-12">
                                <Bell size={40} className="mx-auto text-gray-200 dark:text-white/10 mb-4" />
                                <p className="text-gray-400 text-sm font-semibold">No notifications sent yet</p>
                            </div>
                        ) : (
                            notifications.data.map((notif) => (
                                <div key={notif.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{notif.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.body}</p>
                                        </div>
                                        <span className="flex-none px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-orange-50 text-[#FF6600] dark:bg-orange-500/10">
                                            {notif.target_role === 'all' ? 'All' : notif.target_role}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 text-[11px] text-gray-400">
                                        <span>{notif.sent_count} device{notif.sent_count !== 1 ? 's' : ''}</span>
                                        <span>{new Date(notif.created_at).toLocaleDateString('en-GB')} {new Date(notif.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
