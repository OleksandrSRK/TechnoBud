import type { Filters } from '../../types/admin'

type Props = {
    columns: string[]
    filters: Filters
    onFilterChange: (col: string, value: string) => void
}

export default function FilterRow({ columns, filters, onFilterChange }: Props) {
    return (
        <tr className="admin-filter-row">
            {columns.map((col, idx) => (
                <th key={idx}>
                    {col ? (
                        <input
                            placeholder={`Filter ${col}`}
                            value={filters[col] || ''}
                            onChange={e => onFilterChange(col, e.target.value)}
                        />
                    ) : null}
                </th>
            ))}
            <th></th>
        </tr>
    )
}