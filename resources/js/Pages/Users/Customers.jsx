import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import UserListTable from '@/Components/UserListTable';
import UserEditModal from '@/Components/UserEditModal';
import UserAddModal from '@/Components/UserAddModal';
import { useState } from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Customers({ users }) {
    const { t } = useLanguage();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleDelete = (user) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                            {t('users.customerList')} <span className="text-[#FF6600]">{t('users.listHighlight')}</span>
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            <span>Users</span>
                            <span className="size-1 bg-gray-300 rounded-full" />
                            <span>User Control</span>
                            <span className="size-1 bg-gray-300 rounded-full" />
                            <span className="text-[#FF6600]">Customers</span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Customers" />

            <div className="space-y-8">
                <UserListTable
                    title="Customers"
                    users={users}
                    role="Customer"
                    onAddClick={() => setIsAddOpen(true)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <UserEditModal
                show={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                user={selectedUser}
                role="Customer"
            />

            <UserAddModal
                show={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                role="Customer"
            />
        </AuthenticatedLayout>
    );
}
