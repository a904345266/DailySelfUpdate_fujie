'use client';

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

export function BarByKey({
  data,
  label,
  color = '#3b82f6',
  height = 200,
}: {
  data: Record<string, number>;
  label?: string;
  color?: string;
  height?: number;
}) {
  const rows = Object.entries(data).map(([name, value]) => ({ name, value }));
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无数据</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
        <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
        <Tooltip />
        <Bar dataKey="value" name={label ?? '数量'} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PieByKey({
  data,
  height = 220,
}: {
  data: Record<string, number>;
  height?: number;
}) {
  const rows = Object.entries(data).map(([name, value]) => ({ name, value }));
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无数据</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
          {rows.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DailyRatingChart({
  data,
  height = 200,
}: {
  data: Array<{ date: string; rating: number | null }>;
  height?: number;
}) {
  // Show short labels: Mon-Sun in week order
  const rows = data.map((d) => ({
    name: d.date.slice(5),
    rating: d.rating,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
        <YAxis domain={[0, 5]} stroke="#64748b" fontSize={12} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="rating"
          name="评分"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendsChart({
  data,
  height = 260,
}: {
  data: Array<{ weekStart: string; work: number; friend: number; partner: number; gratitude: number }>;
  height?: number;
}) {
  const rows = data.map((d) => ({ ...d, name: d.weekStart.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
        <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="work" name="工作" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="friend" name="朋友" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="partner" name="伴侣" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="gratitude" name="感恩" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RatingTrendChart({
  data,
  height = 200,
}: {
  data: Array<{ weekStart: string; avgRating: number | null }>;
  height?: number;
}) {
  const rows = data.map((d) => ({ name: d.weekStart.slice(5), avgRating: d.avgRating }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
        <YAxis domain={[0, 5]} stroke="#64748b" fontSize={12} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="avgRating"
          name="周平均评分"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
