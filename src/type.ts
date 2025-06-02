import { LovelaceCardConfig } from "./ha/data/lovelace";
import { StatisticType } from "./ha/data/recorder";

export interface StatisticsTableCardConfig extends LovelaceCardConfig {
  entity: string;
  title?: string;
  unit?: string;
  start_date?: Date | string;
  end_date?: Date | string;
  statistics_type?: StatisticType | StatisticType[];
  period?: "5minute" | "hour" | "day" | "week" | "month";
}