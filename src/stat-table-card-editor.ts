import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "./ha/types";
import { StatisticsTableCardConfig } from "./type";
import { fireEvent } from "./ha/common/dom/fire_event";

const SCHEMA = [
  { name: "entity", required: true, selector: { statistic: {} } },
  { name: "title", selector: { text: {} } },
  { name: "unit", selector: { text: {} } },
  {
    type: "grid",
    schema: [
      { name: "start_date", selector: { date: {} } },
      { name: "end_date", selector: { date: {} } },
    ],
  },
  {
    name: "period",
    selector: {
      select: {
        options: [
          { value: "5minute", label: "5 Minute" },
          { value: "hour", label: "Hour" },
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ],
        mode: "dropdown",
      },
    },
  },
  {
    name: "statistics_type",
    selector: {
      select: {
        options: [
          { value: "change", label: "Change" },
          { value: "last_reset", label: "Last Reset" },
          { value: "max", label: "Max" },
          { value: "mean", label: "Mean" },
          { value: "min", label: "Min" },
          { value: "state", label: "State" },
          { value: "sum", label: "Sum" },
        ],
        reorder: true,
        multiple: true,
      },
    },
  },
]

@customElement("statistics-table-card-editor")
export class StatisticsTableCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: StatisticsTableCardConfig;

  setConfig(config: StatisticsTableCardConfig): void {
    this._config = config;
  }

  protected render() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    let config = ev.detail.value as StatisticsTableCardConfig;
    if (!config) {
      return;
    }

    fireEvent(this, "config-changed", { config });
  }
}
