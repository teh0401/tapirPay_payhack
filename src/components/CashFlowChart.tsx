import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CashFlowChartProps {
  data: Array<{
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const currentBalance = data[data.length - 1]?.balance || 0;
  const previousBalance = data[data.length - 2]?.balance || 0;
  const balanceChange = currentBalance - previousBalance;
  const isPositive = balanceChange >= 0;

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + Math.abs(item.expenses), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            MYR {currentBalance.toFixed(2)}
          </div>
          <p className={`text-xs ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}MYR {balanceChange.toFixed(2)} from last period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            +MYR {totalIncome.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            -MYR {totalExpenses.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
          {(totalIncome - totalExpenses) >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-success' : 'text-destructive'}`}>
            {(totalIncome - totalExpenses) >= 0 ? '+' : ''}MYR {(totalIncome - totalExpenses).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Income - Expenses
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Cash Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `MYR ${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                formatter={(value: number, name: string) => [
                  `MYR ${value.toFixed(2)}`,
                  name === 'income' ? 'Income' : 'Expenses'
                ]}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--success))" }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
