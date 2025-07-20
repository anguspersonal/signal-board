# Chart Component Documentation

## Overview

The chart component is a comprehensive wrapper around Recharts that provides:
- Theme-aware styling with CSS custom properties
- Consistent tooltip and legend components
- Type-safe configuration
- Responsive design

## Components

### ChartContainer
The main wrapper component that provides context and styling.

```tsx
import { ChartContainer } from '@/components/ui/chart'

<ChartContainer config={chartConfig}>
  <Recharts.LineChart data={data}>
    {/* Chart components */}
  </Recharts.LineChart>
</ChartContainer>
```

### ChartTooltip & ChartTooltipContent
Custom tooltip components with consistent styling.

```tsx
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

<Recharts.Tooltip content={<ChartTooltipContent />} />
```

### ChartLegend & ChartLegendContent
Custom legend components with consistent styling.

```tsx
import { ChartLegend, ChartLegendContent } from '@/components/ui/chart'

<Recharts.Legend content={<ChartLegendContent />} />
```

## Configuration

The `ChartConfig` type defines how chart elements are styled and labeled:

```tsx
type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<'light' | 'dark', string> }
  )
}
```

### Example Configuration

```tsx
const config = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  users: {
    label: 'Active Users',
    theme: {
      light: 'hsl(var(--chart-2))',
      dark: 'hsl(var(--chart-3))',
    },
  },
}
```

## Usage Examples

### Basic Line Chart

```tsx
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import * as Recharts from 'recharts'

const data = [
  { month: 'Jan', revenue: 400 },
  { month: 'Feb', revenue: 300 },
  { month: 'Mar', revenue: 600 },
]

const config = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
}

function RevenueChart() {
  return (
    <ChartContainer config={config}>
      <Recharts.LineChart data={data}>
        <Recharts.CartesianGrid strokeDasharray="3 3" />
        <Recharts.XAxis dataKey="month" />
        <Recharts.YAxis />
        <Recharts.Tooltip content={<ChartTooltipContent />} />
        <Recharts.Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="hsl(var(--chart-1))" 
          strokeWidth={2}
        />
      </Recharts.LineChart>
    </ChartContainer>
  )
}
```

### Bar Chart with Legend

```tsx
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart'
import * as Recharts from 'recharts'

const data = [
  { category: 'A', value1: 400, value2: 240 },
  { category: 'B', value1: 300, value2: 139 },
  { category: 'C', value1: 200, value2: 980 },
]

const config = {
  value1: {
    label: 'Series 1',
    color: 'hsl(var(--chart-1))',
  },
  value2: {
    label: 'Series 2',
    color: 'hsl(var(--chart-2))',
  },
}

function BarChart() {
  return (
    <ChartContainer config={config}>
      <Recharts.BarChart data={data}>
        <Recharts.CartesianGrid strokeDasharray="3 3" />
        <Recharts.XAxis dataKey="category" />
        <Recharts.YAxis />
        <Recharts.Tooltip content={<ChartTooltipContent />} />
        <Recharts.Legend content={<ChartLegendContent />} />
        <Recharts.Bar dataKey="value1" fill="hsl(var(--chart-1))" />
        <Recharts.Bar dataKey="value2" fill="hsl(var(--chart-2))" />
      </Recharts.BarChart>
    </ChartContainer>
  )
}
```

## CSS Custom Properties

The chart component uses CSS custom properties for theming. These are defined in `globals.css`:

```css
:root {
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
}

.dark {
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}
```

## Integration Notes

1. **Dependencies**: Ensure `recharts` is installed (`npm install recharts`)
2. **Theme Support**: The component automatically adapts to light/dark themes
3. **Responsive**: Uses `Recharts.ResponsiveContainer` for responsive behavior
4. **TypeScript**: Fully typed with proper TypeScript support
5. **Styling**: Integrates with Tailwind CSS and the design system

## Available Chart Types

The component supports all Recharts chart types:
- LineChart
- BarChart
- AreaChart
- PieChart
- ScatterChart
- ComposedChart
- And more...

## Best Practices

1. Always provide a `config` object for consistent styling
2. Use CSS custom properties for colors to support theming
3. Wrap chart components in `ChartContainer`
4. Use `ChartTooltipContent` and `ChartLegendContent` for consistent UI
5. Test in both light and dark themes 