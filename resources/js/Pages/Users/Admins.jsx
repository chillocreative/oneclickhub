import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import UserListTable from '@/Components/UserListTable';
import UserEditModal from '@/Components/UserEditModal';
import UserAddModal from '@/Components/UserAddModal';
import { useState } from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Admins({ users }) {
    const { t } = useLanguage();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleDelete = (user) => {
        if (confirm(`Are you sure you want to delete ${user.name}? This might affect system access.`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                            {t('users.adminList')} <span className="text-[#FF6600]">{t('users.listHighlight')}</span>
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            <span>Users</span>
                            <span className="size-1 bg-gray-300 rounded-full" />
                            <span>User Control</span>
                            <span className="size-1 bg-gray-300 rounded-full" />
                            <span className="text-[#FF6600]">Admins & Staff</span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Admins & Staff" />

            <div className="space-y-8">
                <UserListTable
                    title="Admins"
                    users={users}
                    role="Admin"
                    onAddClick={() => setIsAddOpen(true)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <UserEditModal
                show={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                user={selectedUser}
                role="Admin"
            />

            <UserAddModal
                show={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                role="Admin"
            />
        </AuthenticatedLayout>
    );
}
