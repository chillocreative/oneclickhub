import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    MessageCircle,
    ShoppingBag,
    ShieldCheck,
    Layers,
    ChevronDown,
    CreditCard,
    Plus,
    Heart,
    Globe,
    User,
    Calendar,
    Landmark,
    FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessNotification from '@/Components/SuccessNotification';
import { router } from '@inertiajs/react';
import { LanguageSwitcher } from '@/Contexts/LanguageContext';

const SidebarItem = ({ href, icon: Icon, label, active, collapsed, children }) => {
    const [isOpen, setIsOpen] = useState(active || false);
    const hasChildren = Boolean(children);

    useEffect(() => {
        if (active) setIsOpen(true);
    }, [active]);

    return (
        <div>
            <Link
                href={hasChildren ? '#' : href}
                onClick={(e) => {
                    if (hasChildren) {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative ${active
                    ? 'bg-white text-[#FF6600] shadow-[0_10px_20px_-5px_rgba(255,102,0,0.3)]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
            >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!collapsed && (
                    <div className="flex-1 flex items-center justify-between">
                        <span className="font-bold text-sm tracking-tight">{label}</span>
                        {hasChildren && (
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            />
                        )}
                    </div>
                )}
            </Link>

            {!collapsed && hasChildren && isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="ml-9 mt-1 space-y-1 overflow-hidden"
                >
                    {children}
                </motion.div>
            )}
        </div>
    );
};

const SubItem = ({ href, label, active }) => (
    <Link
        href={href}
        className={`block px-4 py-2 text-xs font-bold rounded-lg transition-all ${active
            ? 'text-white bg-white/10'
            : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
    >
        {label}
    </Link>
);

function AdminSidebar({ collapsed }) {
    return (
        <>
            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'Overview'}
                </div>
                <SidebarItem
                    href={route('dashboard')}
                    icon={LayoutDashboard}
                    label="Analytics Hub"
                    active={route().current('dashboard')}
                    collapsed={collapsed}
                />
            </div>

            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'User Management'}
                </div>
                <SidebarItem
                    icon={ShieldCheck}
                    label="User Control"
                    active={route().current('users.*')}
                    collapsed={collapsed}
                >
                    <SubItem href={route('users.freelancers')} label="Freelancers" active={route().current('users.freelancers')} />
                    <SubItem href={route('users.customers')} label="Customers" active={route().current('users.customers')} />
                    <SubItem href={route('users.admins')} label="Admins & Staff" active={route().current('users.admins')} />
                </SidebarItem>
            </div>

            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'Revenue Center'}
                </div>
                <SidebarItem
                    icon={CreditCard}
                    label="Subscriptions"
                    active={route().current('subscriptions.*')}
                    collapsed={collapsed}
                >
                    <SubItem href={route('subscriptions.index')} label="Overview" active={route().current('subscriptions.index')} />
                    <SubItem href={route('subscriptions.plans')} label="Plans Management" active={route().current('subscriptions.plans')} />
                    <SubItem href={route('subscriptions.settings')} label="Subscription Settings" active={route().current('subscriptions.settings')} />
                    <SubItem href={route('subscriptions.gateways')} label="Payment Gateways" active={route().current('subscriptions.gateways')} />
                    <SubItem href={route('subscriptions.transactions')} label="Transactions" active={route().current('subscriptions.transactions')} />
                </SidebarItem>
            </div>

            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'Operations'}
                </div>
                <SidebarItem
                    href={route('admin.orders.index')}
                    icon={ShoppingBag}
                    label="Orders"
                    active={route().current('admin.orders.*')}
                    collapsed={collapsed}
                />
                <SidebarItem
                    href={route('admin.ssm.index')}
                    icon={FileCheck}
                    label="SSM Verifications"
                    active={route().current('admin.ssm.*')}
                    collapsed={collapsed}
                />
                <SidebarItem
                    href={route('admin.categories.index')}
                    icon={Layers}
                    label="Categories"
                    active={route().current('admin.categories.*')}
                    collapsed={collapsed}
                />
            </div>

            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'System'}
                </div>
                <SidebarItem
                    href={route('admin.settings')}
                    icon={Settings}
                    label="Settings"
                    active={route().current('admin.settings')}
                    collapsed={collapsed}
                />
                <SidebarItem
                    href={route('profile.edit')}
                    icon={User}
                    label="Profile"
                    active={route().current('profile.edit')}
                    collapsed={collapsed}
                />
            </div>
        </>
    );
}

function FreelancerSidebar({ collapsed }) {
    return (
        <>
            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'Overview'}
                </div>
                <SidebarItem
                    href={route('dashboard')}
                    icon={LayoutDashboard}
                    label="My Dashboard"
                    active={route().current('dashboard')}
                    collapsed={collapsed}
                />
            </div>

            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'Services'}
                </div>
                <SidebarItem
                    icon={Briefcase}
                    label="My Services"
                    active={route().current('my-services.*')}
                    collapsed={collapsed}
                >
                    <SubItem href={route('my-services.index')} label="All Services" active={route().current('my-services.index')} />
                    <SubItem href={route('my-services.create')} label="Create New" active={route().current('my-services.create')} />
                </SidebarItem>
                <SidebarItem
                    href={route('calendar.index')}
                    icon={Calendar}
                    label="Calendar"
                    active={route().current('calendar.*')}
                    collapsed={collapsed}
                />
                <SidebarItem
                    href={route('orders.freelancer')}
                    icon={ShoppingBag}
                    label="Orders"
                    active={route().current('orders.freelancer')}
                    collapsed={collapsed}
                />
                <SidebarItem
                    href={route('chat.index')}
                    icon={MessageCircle}
                    label="Messages"
                    active={route().current('chat.*')}
                    collapsed={collapsed}
                />
            </div>

            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'Account'}
                </div>
                <SidebarItem
                    href={route('subscribe.plans')}
                    icon={CreditCard}
                    label="Subscription"
                    active={route().current('subscribe.*')}
                    collapsed={collapsed}
                />
                <SidebarItem
                    href={route('settings.banking')}
                    icon={Landmark}
                    label="Banking Details"
                    active={route().current('settings.banking')}
                    collapsed={collapsed}
                />
                <SidebarItem
                    href={route('profile.edit')}
                    icon={Settings}
                    label="Profile"
                    active={route().current('profile.edit')}
                    collapsed={collapsed}
                />
            </div>
        </>
    );
}

function CustomerSidebar({ collapsed }) {
    return (
        <>
            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'Overview'}
                </div>
                <SidebarItem
                    href={route('dashboard')}
                    icon={LayoutDashboard}
                    label="Dashboard"
                    active={route().current('dashboard')}
                    collapsed={collapsed}
                />
            </div>

            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'Explore'}
                </div>
                <SidebarItem
                    href={route('services.browse')}
                    icon={Globe}
                    label="Browse Services"
                    active={route().current('services.browse')}
                    collapsed={collapsed}
                />
                <SidebarItem
                    href={route('orders.customer')}
                    icon={ShoppingBag}
                    label="My Bookings"
                    active={route().current('orders.customer')}
                    collapsed={collapsed}
                />
                <SidebarItem
                    href={route('chat.index')}
                    icon={MessageCircle}
                    label="Messages"
                    active={route().current('chat.*')}
                    collapsed={collapsed}
                />
            </div>

            <div className="space-y-2">
                <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '...' : 'Account'}
                </div>
                <SidebarItem
                    href={route('profile.edit')}
                    icon={Settings}
                    label="Profile"
                    active={route().current('profile.edit')}
                    collapsed={collapsed}
                />
            </div>
        </>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash, unreadMessages, notificationCount, ssm } = usePage().props;
    const user = auth.user;
    const roles = user?.roles || [];
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const isAdmin = roles.includes('Admin');
    const isFreelancer = roles.includes('Freelancer');

    const getRoleLabel = () => {
        if (isAdmin) return 'Admin';
        if (isFreelancer) return 'Freelancer';
        return 'Customer';
    };

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccess(true);
        }
    }, [flash?.success]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsCollapsed(true);
            else setIsCollapsed(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#0c0c0c] flex overflow-hidden">
            <SuccessNotification
                message={showSuccess ? successMessage : ''}
                onClear={() => setShowSuccess(false)}
            />
            {/* Mobile Menu Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isCollapsed ? 'w-24' : 'w-72'
                    } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                bg-gradient-to-br from-[#FF6600] via-[#FF8800] to-[#FFB800] shadow-[10px_0_40px_rgba(255,102,0,0.15)]`}
            >
                <div className="h-full flex flex-col p-5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Logo */}
                    <div className="flex items-center justify-between mb-10 px-2 z-10 transition-all duration-300">
                        <Link href="/" className="flex items-center gap-3 group flex-none">
                            <div className={`flex-none bg-white shadow-xl rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 ${isCollapsed ? 'w-12 h-12 p-1.5' : 'w-16 h-16 p-2'}`}>
                                <ApplicationLogo />
                            </div>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-2xl font-black text-white tracking-tighter"
                                >
                                    ONECLICK<span className="text-[#2B313F]">HUB</span>
                                </motion.span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                        >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar z-10 space-y-8">
                        {isAdmin && <AdminSidebar collapsed={isCollapsed} />}
                        {!isAdmin && isFreelancer && <FreelancerSidebar collapsed={isCollapsed} />}
                        {!isAdmin && !isFreelancer && <CustomerSidebar collapsed={isCollapsed} />}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto">
                <header className="h-24 bg-white/70 dark:bg-[#0c0c0c]/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-10 sticky top-0 z-40 transition-all">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="hidden md:flex items-center gap-4 px-5 py-3 bg-[#fcfcfc] dark:bg-[#111] rounded-[1.5rem] text-gray-400 border border-gray-100 dark:border-white/5 focus-within:ring-2 focus-within:ring-[#FF6600]/20 transition-all min-w-[320px]">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-gray-500 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="p-3 text-gray-400 hover:bg-orange-50 dark:hover:bg-white/5 rounded-2xl relative cursor-pointer group transition-all">
                                <Bell size={20} />
                                {notificationCount > 0 && (
                                    <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-[#FF6600] rounded-full border-2 border-white dark:border-[#0c0c0c] text-[9px] text-white font-black flex items-center justify-center">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </div>
                            <Link href={route('chat.index')} className="p-3 text-gray-400 hover:bg-orange-50 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-all relative">
                                <MessageCircle size={20} />
                                {unreadMessages > 0 && (
                                    <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-[#FF6600] rounded-full border-2 border-white dark:border-[#0c0c0c] text-[9px] text-white font-black flex items-center justify-center">
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </span>
                                )}
                            </Link>
                        </div>

                        <LanguageSwitcher className="hidden sm:flex" />
                        <div className="h-10 w-px bg-gray-100 dark:bg-white/5 mx-2 hidden sm:block" />

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-4 p-1.5 rounded-2xl hover:bg-orange-50 dark:hover:bg-white/5 transition-all group">
                                    <div className="size-11 rounded-2xl bg-gradient-to-tr from-[#FF6600] to-[#FFB800] p-[2.5px] shadow-lg group-hover:scale-105 transition-all">
                                        <div className="size-full bg-white dark:bg-gray-900 rounded-[11px] flex items-center justify-center font-black text-[#FF6600]">
                                            {user.name ? user.name.charAt(0) : '?'}
                                        </div>
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <div className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[120px]">{user.name}</div>
                                        <div className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">{getRoleLabel()}</div>
                                    </div>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Logout</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {ssm && ssm.status === 'in_grace' && (
                    <div className="mx-10 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center gap-3">
                        <FileCheck size={20} className="text-yellow-600 flex-shrink-0" />
                        <p className="text-sm font-bold text-yellow-800">
                            Upload your SSM certificate within <span className="text-yellow-900 font-black">{ssm.graceDaysRemaining} day(s)</span> to keep your services visible.
                            <Link href={route('settings.banking')} className="ml-2 underline text-[#FF6600] hover:text-[#FF8800]">Upload now</Link>
                        </p>
                    </div>
                )}
                {ssm && ssm.status === 'expired' && (
                    <div className="mx-10 mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                        <FileCheck size={20} className="text-red-600 flex-shrink-0" />
                        <p className="text-sm font-bold text-red-800">
                            Your services are hidden because your SSM verification has expired. Upload a valid SSM certificate to reactivate.
                            <Link href={route('settings.banking')} className="ml-2 underline text-[#FF6600] hover:text-[#FF8800]">Upload now</Link>
                        </p>
                    </div>
                )}

                <main className="flex-1 p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={route().current()}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                        >
                            {header && (
                                <div className="mb-10">
                                    {header}
                                </div>
                            )}
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
