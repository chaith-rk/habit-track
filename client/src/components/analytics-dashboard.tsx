import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  totalHabits: number;
  completedToday: number;
  overallCompletionRate: number;
  weeklyProgress: Array<{ date: string; completionRate: number }>;
  categoryStats: Record<string, number>;
}

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-center py-8 text-slate-500">Loading analytics...</div>
        </div>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-center py-8 text-slate-500">No analytics data available</div>
        </div>
      </section>
    );
  }

  const weeklyTableData = analytics.weeklyProgress.map((day) => ({
    day: new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
    completion: day.completionRate,
  }));

  const categoryTableData = Object.entries(analytics.categoryStats).map(([category, count]) => ({
    category,
    count,
    percentage: analytics.totalHabits > 0 ? Math.round((count / analytics.totalHabits) * 100) : 0,
  }));

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Analytics Dashboard</h3>
        
        {/* Three Tables Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Table 1: Summary Stats */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">Summary Stats</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-slate-600">Metric</th>
                    <th className="text-right p-3 font-medium text-slate-600">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="p-3 text-slate-700">Total Habits</td>
                    <td className="p-3 text-right font-semibold text-primary">{analytics.totalHabits}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="p-3 text-slate-700">Completed Today</td>
                    <td className="p-3 text-right font-semibold text-secondary">{analytics.completedToday}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="p-3 text-slate-700">Overall Rate</td>
                    <td className="p-3 text-right font-semibold text-accent">{analytics.overallCompletionRate}%</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="p-3 text-slate-700">Remaining Today</td>
                    <td className="p-3 text-right font-semibold text-slate-600">{analytics.totalHabits - analytics.completedToday}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Weekly Progress */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">Weekly Progress</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-slate-600">Day</th>
                    <th className="text-right p-3 font-medium text-slate-600">Rate</th>
                  </tr>
                </thead>
                <tbody className="max-h-48 overflow-y-auto">
                  {weeklyTableData.length > 0 ? (
                    weeklyTableData.map((day, index) => (
                      <tr key={index} className="border-t border-slate-100">
                        <td className="p-3 text-slate-700">{day.day}</td>
                        <td className="p-3 text-right">
                          <span className={`font-semibold ${
                            day.completion >= 80 ? 'text-secondary' : 
                            day.completion >= 50 ? 'text-accent' : 'text-slate-500'
                          }`}>
                            {day.completion}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-3 text-center text-slate-500">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Table 3: Category Distribution */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">Habit Categories</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-slate-600">Category</th>
                    <th className="text-right p-3 font-medium text-slate-600">Count</th>
                    <th className="text-right p-3 font-medium text-slate-600">%</th>
                  </tr>
                </thead>
                <tbody className="max-h-48 overflow-y-auto">
                  {categoryTableData.length > 0 ? (
                    categoryTableData.map((category, index) => (
                      <tr key={index} className="border-t border-slate-100">
                        <td className="p-3 text-slate-700">{category.category}</td>
                        <td className="p-3 text-right font-semibold text-primary">{category.count}</td>
                        <td className="p-3 text-right font-semibold text-slate-600">{category.percentage}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-slate-500">No categories yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
