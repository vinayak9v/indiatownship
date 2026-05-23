interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: 'navy' | 'gold' | 'green' | 'red';
}

const colorMap = {
  navy: 'bg-navy text-white',
  gold: 'bg-gold text-navy',
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
};

export function StatCard({ label, value, icon, color = 'navy' }: StatCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
