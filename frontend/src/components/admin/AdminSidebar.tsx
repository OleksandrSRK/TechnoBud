type Props = {
    tab: string
    onTabChange: (tab: 'users' | 'products' | 'categories' | 'brands' | 'orders') => void
}

const TABS = ['users', 'products', 'categories', 'brands', 'orders'] as const

export default function AdminSidebar({ tab, onTabChange }: Props) {
    return (
        <div className="admin-sidebar">
            <h2>Admin Panel</h2>
            {TABS.map(t => (
                <button
                    key={t}
                    className={tab === t ? 'active' : ''}
                    onClick={() => onTabChange(t)}
                >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
            ))}
        </div>
    )
}