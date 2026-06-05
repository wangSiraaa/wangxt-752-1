import { useStore } from '@/store/useStore';
import { ROLE_LABELS } from '@/types';
import type { Role } from '@/types';
import { Users, Monitor, ShieldCheck } from 'lucide-react';

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  tenant: <Users className="w-4 h-4" />,
  frontdesk: <Monitor className="w-4 h-4" />,
  admin: <ShieldCheck className="w-4 h-4" />,
};

const ROLES: Role[] = ['tenant', 'frontdesk', 'admin'];

export default function RoleSelector() {
  const { role, setRole } = useStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 mr-1">角色:</span>
      {ROLES.map((r) => (
        <button
          key={r}
          data-testid={`role-${r}`}
          onClick={() => setRole(r)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            role === r
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {ROLE_ICONS[r]}
          {ROLE_LABELS[r]}
        </button>
      ))}
    </div>
  );
}
