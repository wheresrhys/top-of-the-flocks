declare module 'react-chartkick' {
  export type ScatterChartProps = {
    data: ScatterChartData[];
    xtitle: string;
    ytitle: string;
    colors: string[];
    min: number | null;
    library: {
      elements: {
        point: {
          radius: number;
        };
      };
    };
  };
  export type ScatterChartData = {
    name: string;
    data: [number, number][];
  };
  export function ScatterChart(props: ScatterChartProps): React.ReactNode;
}
