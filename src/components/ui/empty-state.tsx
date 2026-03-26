import { Card } from './card';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </Card>
  );
}
