// frontend/components/charts/CoverageChart.js
'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const EDITORIAL_PALETTE = [
  '#8B2635', // Deep Burgundy
  '#234B70', // Editorial Blue
  '#4A7C59', // Forest Green
  '#D4A373', // Warm Ochre
  '#6D597A', // Muted Plum
  '#355070', // Navy
  '#B56576', // Dusty Rose
  '#E56B6F', // Coral
];

export default function CoverageChart({ chart }) {
  if (!chart || !chart.data || chart.data.length === 0) {
    return null;
  }

  const { type = 'bar', title, data } = chart;
  // The backend says which fields hold the label and the number.
  const xKey = chart.x_key || 'name';
  const yKey = chart.y_key || 'value';

  return (
    <div
      style={{
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        marginTop: '16px',
      }}
    >
      {title && (
        <h4
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.1rem',
            marginBottom: '16px',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h4>
      )}

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.82rem',
                }}
              />
              <Pie
                data={data}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={95}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={EDITORIAL_PALETTE[index % EDITORIAL_PALETTE.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis
                dataKey={xKey}
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.82rem',
                }}
              />
              <Bar dataKey={yKey} fill="var(--accent-burgundy)" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
