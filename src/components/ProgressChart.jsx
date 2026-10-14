import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function shortDate(value) {
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function ProgressChart({ entries = [] }) {
  const data = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({ ...entry, label: shortDate(entry.date) }))

  return (
    <div className="chart-wrap">
      {data.length < 2 ? (
        <div className="chart-empty">
          <div className="chart-empty-icon">⌁</div>
          <strong>{data.length ? 'Add one more entry to see your trend' : 'Your progress starts here'}</strong>
          <span>Log your weight or workout to bring this chart to life.</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 10, left: -18, bottom: 2 }}>
            <CartesianGrid stroke="#292e2b" strokeDasharray="4 7" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#858c87', fontSize: 11 }} dy={10} />
            <YAxis yAxisId="weight" axisLine={false} tickLine={false} tick={{ fill: '#858c87', fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
            <YAxis yAxisId="duration" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#858c87', fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} width={34} />
            <Tooltip
              contentStyle={{ background: '#1c211e', border: '1px solid #333b35', borderRadius: 12, color: '#f2f4f2' }}
              labelStyle={{ color: '#aab2ac', marginBottom: 4 }}
              formatter={(value, name) => [`${value}${name === 'weight' ? ' kg' : ' min'}`, name === 'weight' ? 'Weight' : 'Duration']}
            />
            <Line yAxisId="weight" type="monotone" dataKey="weight" name="weight" stroke="#a7f36b" strokeWidth={2.5} dot={{ r: 3, fill: '#a7f36b', strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls />
            <Line yAxisId="duration" type="monotone" dataKey="duration" name="duration" stroke="#77b8ff" strokeWidth={2} dot={{ r: 3, fill: '#77b8ff', strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
