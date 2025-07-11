import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Star } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { getColorByScore } from "@/utils/scoreUtil";

const chartConfig = {
  score: {
    label: "Nota",
    icon: Star,
  },
} satisfies ChartConfig;

const Chart = ({
  chartData,
  height = "h-[250px] lg:h-[280px] xl:h-[300px] 2xl:h-[370px]",
  barSize = 28,
}: {
  chartData: {
    semester: string;
    score: number;
  }[];
  height?: string;
  barSize?: number;
}) => {
  return (
    <ChartContainer
      config={chartConfig}
      className={`${height} w-full self-center`}
      style={{ width: "100%" }}
    >
      <ResponsiveContainer>
        <BarChart
          accessibilityLayer
          data={chartData}
          barSize={barSize}
          className=""
          margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="semester"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis
            ticks={[0, 1, 2, 3, 4, 5]}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            domain={[0, 5]}
            width={30}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="score" radius={4}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorByScore(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default Chart;
