import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/card';

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-neutral-900">Actions rapides</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 border-transparent transition-all hover:border-[#1B5E20] hover:shadow-md ${action.color}`}
            >
              <action.icon size={28} className="mb-2" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
