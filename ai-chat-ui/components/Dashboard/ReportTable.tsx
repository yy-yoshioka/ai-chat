interface ReportTableProps {
  rows: { id: string; value: string }[];
}

export default function ReportTable({ rows }: ReportTableProps) {
  return (
    <table className="min-w-full border mt-4 text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b">
            <td className="p-2">{r.id}</td>
            <td className="p-2">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
