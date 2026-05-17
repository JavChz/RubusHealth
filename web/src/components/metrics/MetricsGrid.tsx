import { useStatsStore } from '../../store/useStatsStore';
import { CpuCard } from './CpuCard';
import { RamCard } from './RamCard';
import { DiskCard } from './DiskCard';

export function MetricsGrid() {
  const { stats, isLoading } = useStatsStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <CpuCard stats={stats} loading={isLoading} />
      <RamCard stats={stats} loading={isLoading} />
      <DiskCard stats={stats} loading={isLoading} />
    </div>
  );
}
