'use client'

import * as React from 'react'
import * as Recharts from 'recharts'
import { cn } from '@/lib/utils'

// Theme config for CSS scoping
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextType = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextType | null>(null)

function useChartContext() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error('useChartContext must be used within ChartContainer')
  return context
}

/* ----------------------------------------------------------------------------
 * ChartContainer
 * -------------------------------------------------------------------------- */
export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig
    children: React.ReactNode
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId().replace(/:/g, '')
  const chartId = `chart-${id || uniqueId}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          'flex aspect-video justify-center text-xs',
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground',
          '[&_.recharts-cartesian-grid_line[stroke="#ccc"]]:stroke-border/50',
          '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border',
          '[&_.recharts-dot[stroke="#fff"]]:stroke-transparent',
          '[&_.recharts-layer]:outline-none',
          '[&_.recharts-polar-grid_[stroke="#ccc"]]:stroke-border',
          '[&_.recharts-radial-bar-background-sector]:fill-muted',
          '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted',
          '[&_.recharts-reference-line_[stroke="#ccc"]]:stroke-border',
          '[&_.recharts-sector[stroke="#fff"]]:stroke-transparent',
          '[&_.recharts-sector]:outline-none',
          '[&_.recharts-surface]:outline-none',
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <Recharts.ResponsiveContainer>
          {React.isValidElement(children) ? children : <div>{children}</div>}
        </Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'ChartContainer'

/* ----------------------------------------------------------------------------
 * ChartStyle: Inject theme-based CSS variables
 * -------------------------------------------------------------------------- */
export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const themedColors = Object.entries(config).filter(([, c]) => c.theme || c.color)
  if (!themedColors.length) return null

  const styleContent = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const declarations = themedColors
        .map(([key, conf]) => {
          const color = conf.theme?.[theme as keyof typeof THEMES] || conf.color
          return color ? `  --color-${key}: ${color};` : null
        })
        .filter(Boolean)
        .join('\n')

      return `${prefix} [data-chart=${id}] {\n${declarations}\n}`
    })
    .join('\n')

  return <style dangerouslySetInnerHTML={{ __html: styleContent }} />
}

/* ----------------------------------------------------------------------------
 * ChartTooltip & ChartTooltipContent
 * -------------------------------------------------------------------------- */
export const ChartTooltip = Recharts.Tooltip

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    active?: boolean
    payload?: Array<{
      dataKey?: string
      name?: string
      value?: number
      payload?: Record<string, unknown>
      color?: string
    }>
    label?: string
    className?: string
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: 'line' | 'dot' | 'dashed'
    formatter?: (value: number, name: string, props: unknown, index: number, payload: unknown) => React.ReactNode
    labelFormatter?: (value: string | React.ReactNode, payload: unknown) => React.ReactNode
    labelClassName?: string
    color?: string
    nameKey?: string
    labelKey?: string
  }
>((props, ref) => {
  const {
    active,
    payload,
    label,
    className,
    hideLabel = false,
    hideIndicator = false,
    indicator = 'dot',
    formatter,
    labelFormatter,
    labelClassName,
    color,
    nameKey,
    labelKey,
  } = props

  const { config } = useChartContext()
  if (!active || !payload?.length) return null

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  const renderLabel = () => {
    if (hideLabel || !payload.length) return null

    const item = payload[0]
    const key = labelKey || item.dataKey || item.name || 'value'
    const itemConfig = getPayloadConfig(config, item, key)
    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof ChartConfig]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>
    }

    return value ? <div className={cn('font-medium', labelClassName)}>{value}</div> : null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className
      )}
    >
      {!nestLabel && renderLabel()}
      <div className="grid gap-1.5">
        {payload.map((item, i) => {
          const key = nameKey || item.name || item.dataKey || 'value'
          const itemConfig = getPayloadConfig(config, item, key)
          const fillColor = color || item.payload?.fill || item.color

          return (
            <div
              key={item.dataKey}
              className={cn(
                'flex flex-wrap items-stretch gap-2',
                '[&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                indicator === 'dot' && 'items-center'
              )}
            >
              {formatter && item.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, i, item.payload)
              ) : (
                <>
                  {itemConfig?.icon && !hideIndicator ? (
                    <itemConfig.icon />
                  ) : !hideIndicator ? (
                    <div
                      className={cn(
                        'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                        {
                          'h-2.5 w-2.5': indicator === 'dot',
                          'w-1': indicator === 'line',
                          'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                          'my-0.5': nestLabel && indicator === 'dashed',
                        }
                      )}
                      style={
                        {
                          '--color-bg': fillColor,
                          '--color-border': fillColor,
                        } as React.CSSProperties
                      }
                    />
                  ) : null}
                  <div className={cn('flex flex-1 justify-between leading-none', nestLabel ? 'items-end' : 'items-center')}>
                    <div className="grid gap-1.5">
                      {nestLabel && renderLabel()}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {item.value?.toLocaleString?.() || ''}
                    </span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = 'ChartTooltipContent'

/* ----------------------------------------------------------------------------
 * ChartLegend & ChartLegendContent
 * -------------------------------------------------------------------------- */
export const ChartLegend = Recharts.Legend

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    payload?: Array<{
      dataKey?: string
      value?: string
      color?: string
    }>
    verticalAlign?: 'top' | 'bottom'
    hideIcon?: boolean
    nameKey?: string
  }
>(({ className, payload, verticalAlign = 'bottom', hideIcon = false, nameKey }, ref) => {
  const { config } = useChartContext()
  if (!payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className
      )}
    >
      {payload.map((item) => {
        const key = nameKey || item.dataKey || 'value'
        const itemConfig = getPayloadConfig(config, item, key)
        return (
          <div key={item.value} className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground">
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = 'ChartLegendContent'

/* ----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */
function getPayloadConfig(config: ChartConfig, item: Record<string, unknown>, key: string) {
  const safePayload = (item?.payload as Record<string, unknown>) || {}
  const fallbackKey = typeof item?.[key] === 'string' ? item[key] as string : safePayload[key] as string
  return config[fallbackKey] || config[key]
}

/* ----------------------------------------------------------------------------
 * Example Usage Component
 * -------------------------------------------------------------------------- */
export function ExampleChart() {
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
  ]

  const config = {
    value: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))',
    },
  }

  return (
    <ChartContainer config={config}>
      <Recharts.LineChart data={data}>
        <Recharts.CartesianGrid strokeDasharray="3 3" />
        <Recharts.XAxis dataKey="name" />
        <Recharts.YAxis />
        <Recharts.Tooltip content={<ChartTooltipContent />} />
        <Recharts.Line 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(var(--chart-1))" 
          strokeWidth={2}
        />
      </Recharts.LineChart>
    </ChartContainer>
  )
}
