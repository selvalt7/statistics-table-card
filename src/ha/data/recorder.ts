import { HomeAssistant } from "../types";

export type StatisticType = "change" | "state" | "sum" | "min" | "max" | "mean";

export type Statistics = Record<string, StatisticValue[]>;

export interface StatisticValue {
  start: number;
  end: number;
  change?: number | null;
  last_reset?: number | null;
  max?: number | null;
  mean?: number | null;
  min?: number | null;
  sum?: number | null;
  state?: number | null;
}

export interface StatisticsUnitConfiguration {
  energy?: "Wh" | "kWh" | "MWh" | "GJ";
  power?: "W" | "kW";
  pressure?:
    | "Pa"
    | "hPa"
    | "kPa"
    | "bar"
    | "cbar"
    | "mbar"
    | "inHg"
    | "psi"
    | "mmHg";
  temperature?: "°C" | "°F" | "K";
  volume?: "L" | "gal" | "ft³" | "m³";
}

const _statisticTypes = [
  "change",
  "last_reset",
  "max",
  "mean",
  "min",
  "state",
  "sum",
] as const;
export type StatisticsTypes = (typeof _statisticTypes)[number][];

export const fetchStatistics = (
  hass: HomeAssistant,
  startTime: Date,
  endTime?: Date,
  statistic_ids?: string[],
  period: "5minute" | "hour" | "day" | "week" | "month" = "hour",
  units?: StatisticsUnitConfiguration,
  types?: StatisticsTypes
) =>
  hass.callWS<Statistics>({
    type: "recorder/statistics_during_period",
    start_time: startTime.toISOString(),
    end_time: endTime?.toISOString(),
    statistic_ids,
    period,
    units,
    types,
  });