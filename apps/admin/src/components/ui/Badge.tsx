type Status = 'new' | 'contacted' | 'closed' | 'not_interested';

const styles: Record<Status, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-green-100 text-green-700',
  not_interested: 'bg-gray-100 text-gray-600',
};

const labels: Record<Status, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
  not_interested: 'Not Interested',
};

export function Badge({ status }: { status: Status }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
