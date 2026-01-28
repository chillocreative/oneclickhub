import { Search, Plus, Edit2, Trash2, MoreVertical, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserListTable({ title, users, role, onAddClick, onEdit, onDelete }) {
    return (
        <div className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden transition-all duration-500">
            {/* Header Area */}
            <div className="p-8 border-b border-gray-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onAddClick}
                        className="flex items-center gap-2 px-6 py-3 bg-[#34C38F] hover:bg-[#2ca377] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#34C38F]/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add New
                    </button>
                </div>

                <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-12 pr-4 py-3 bg-[#fcfcfc] dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all"
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#fcfcfc] dark:bg-white/[0.02]">
                            <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.2em] first:rounded-tl-2xl">Name</th>
                            <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Position / Role</th>
                            <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Email</th>
                            <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.2em] last:rounded-tr-2xl text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {users && users.length > 0 ? users.map((user, idx) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-orange-50/30 dark:hover:bg-white/[0.01] transition-colors group"
                            >
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-gradient-to-tr from-[#FF6600] to-[#FFB800] p-[2px] shadow-md">
                                            <div className="size-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center font-black text-[#FF6600] text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-gray-900 dark:text-white">{user.name}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.phone_number}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="inline-flex px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-[#FF6600] text-xs font-black uppercase tracking-wider">
                                        {user.position || role}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400">{user.email || 'N/A'}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit && onEdit(user)}
                                            className="p-2 text-[#5B73E8] hover:bg-[#5B73E8]/10 rounded-lg transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(user)}
                                            className="p-2 text-[#F46A6A] hover:bg-[#F46A6A]/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-3xl text-gray-300">
                                            <Search size={32} />
                                        </div>
                                        <div className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">No users found</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-8 bg-[#fcfcfc] dark:bg-white/[0.01] border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Showing 1 to {users?.length || 0} of {users?.length || 0} users
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 border border-gray-100 dark:border-white/5 rounded-lg text-xs font-black text-gray-400 cursor-not-allowed uppercase tracking-widest transition-all">Previous</button>
                    <button className="px-4 py-2 bg-[#FF6600] text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-[#FF6600]/20 transition-all">1</button>
                    <button className="px-4 py-2 border border-gray-100 dark:border-white/5 rounded-lg text-xs font-black text-gray-400 cursor-not-allowed uppercase tracking-widest transition-all">Next</button>
                </div>
            </div>
        </div>
    );
}
