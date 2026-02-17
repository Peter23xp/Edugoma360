import { UserCheck } from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';

export default function ConvocationsPage() {
    return (
        <div className="space-y-5">
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><UserCheck size={22} /> Convocations</h1>
            <EmptyState
                title="Module en cours de développement"
                description="Les convocations parents seront disponibles prochainement. En attendant, utilisez l'envoi SMS pour communiquer avec les parents."
                icon={<UserCheck size={28} />}
            />
        </div>
    );
}
