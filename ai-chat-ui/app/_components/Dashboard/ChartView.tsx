interface ChartViewProps {
  title: string;
  data: { label: string; value: number }[];
}

export default function ChartView({ title }: ChartViewProps) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      {/* Chart implementation would go here */}
      <p>Chart placeholder</p>
    </div>
  );
}
