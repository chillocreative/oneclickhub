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
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessNotification from '@/Components/SuccessNotification';
import { router } from '@inertiajs/react';

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

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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

            {/* Magnificent Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isCollapsed ? 'w-24' : 'w-72'
                    } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
                bg-gradient-to-br from-[#FF6600] via-[#FF8800] to-[#FFB800] shadow-[10px_0_40px_rgba(255,102,0,0.15)]`}
            >
                {/* ... (logo and nav content) ... */}
                <div className="h-full flex flex-col p-5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Logo Section */}
                    <div className="flex items-center justify-between mb-10 px-2 z-10 transition-all duration-300">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-xl shadow-lg transform group-hover:rotate-12 transition-all">
                                <ApplicationLogo className={`transition-all duration-300 ${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'}`} />
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
                        {/* Section 1: Overview */}
                        <div className="space-y-2">
                            <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${isCollapsed ? 'text-center' : ''}`}>
                                {isCollapsed ? '...' : 'Overview'}
                            </div>
                            <SidebarItem
                                href={route('dashboard')}
                                icon={LayoutDashboard}
                                label="Analytics Hub"
                                active={route().current('dashboard')}
                                collapsed={isCollapsed}
                            />
                        </div>

                        {/* Section 2: User Center */}
                        <div className="space-y-2">
                            <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${isCollapsed ? 'text-center' : ''}`}>
                                {isCollapsed ? '...' : 'User Management'}
                            </div>
                            <SidebarItem
                                icon={ShieldCheck}
                                label="User Control"
                                active={route().current('users.*')}
                                collapsed={isCollapsed}
                            >
                                <SubItem href={route('users.freelancers')} label="Freelancers" active={route().current('users.freelancers')} />
                                <SubItem href={route('users.customers')} label="Customers" active={route().current('users.customers')} />
                                <SubItem href={route('users.admins')} label="Admins & Staff" active={route().current('users.admins')} />
                            </SidebarItem>
                        </div>

                        {/* Section 3: Revenue Center (NEW) */}
                        <div className="space-y-2">
                            <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${isCollapsed ? 'text-center' : ''}`}>
                                {isCollapsed ? '...' : 'Revenue Center'}
                            </div>
                            <SidebarItem
                                icon={CreditCard}
                                label="Subscriptions"
                                active={route().current('subscriptions.*')}
                                collapsed={isCollapsed}
                            >
                                <SubItem href={route('subscriptions.index')} label="Overview" active={route().current('subscriptions.index')} />
                                <SubItem href={route('subscriptions.plans')} label="Plans Management" active={route().current('subscriptions.plans')} />
                                <SubItem href={route('subscriptions.settings')} label="Subscription Settings" active={route().current('subscriptions.settings')} />
                                <SubItem href={route('subscriptions.gateways')} label="Payment Gateways" active={route().current('subscriptions.gateways')} />
                                <SubItem href={route('subscriptions.transactions')} label="Transactions" active={route().current('subscriptions.transactions')} />
                            </SidebarItem>
                        </div>

                        {/* Section 4: Operations */}
                        <div className="space-y-2">
                            <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${isCollapsed ? 'text-center' : ''}`}>
                                {isCollapsed ? '...' : 'Operations'}
                            </div>
                            <SidebarItem href="#" icon={ShoppingBag} label="Orders" collapsed={isCollapsed} />
                            <SidebarItem href="#" icon={MessageCircle} label="WhatsApp Config" collapsed={isCollapsed} />
                        </div>

                        {/* Section 5: Configuration */}
                        <div className="space-y-2">
                            <div className={`px-4 text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ${isCollapsed ? 'text-center' : ''}`}>
                                {isCollapsed ? '...' : 'System'}
                            </div>
                            <SidebarItem href="#" icon={Layers} label="Service Categories" collapsed={isCollapsed} />
                            <SidebarItem
                                href={route('profile.edit')}
                                icon={Settings}
                                label="Settings"
                                active={route().current('profile.edit')}
                                collapsed={isCollapsed}
                            />
                        </div>
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
                                placeholder="Search analytics..."
                                className="bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-gray-500 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="p-3 text-gray-400 hover:bg-orange-50 dark:hover:bg-white/5 rounded-2xl relative cursor-pointer group transition-all">
                                <Bell size={20} />
                                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#FF6600] rounded-full border-2 border-white dark:border-[#0c0c0c]" />
                            </div>
                            <div className="p-3 text-gray-400 hover:bg-orange-50 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-all">
                                <MessageCircle size={20} />
                            </div>
                        </div>

                        <div className="h-10 w-px bg-gray-100 dark:bg-white/5 mx-2 hidden sm:block" />

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-4 p-1.5 rounded-2xl hover:bg-orange-50 dark:hover:bg-white/5 transition-all group">
                                    <div className="size-11 rounded-2xl bg-gradient-to-tr from-[#FF6600] to-[#FFB800] p-[2.5px] shadow-lg group-hover:scale-105 transition-all">
                                        <div className="size-full bg-white dark:bg-gray-900 rounded-[11px] flex items-center justify-center font-black text-[#FF6600]">
                                            {user.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <div className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[120px]">{user.name}</div>
                                        <div className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">{user.phone_number === '01110019843' ? 'Super Admin' : 'Admin'}</div>
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
