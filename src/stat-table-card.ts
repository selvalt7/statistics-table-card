import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "./ha/types";
import { StatisticsTableCardConfig } from "./type";
import { registerCustomCard } from "./utils/custom-cards";
import { fetchStatistics, Statistics, StatisticType } from "./ha/data/recorder";

registerCustomCard({
  type: "statistics-table-card",
  name: "Statistics Table Card",
  description: "A card to display statistics in a table format.",
});

@customElement("statistics-table-card")
export class StatisticsTableCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: StatisticsTableCardConfig;

  @state() private _statistics?: Statistics;

  @state() _startDate?: Date;

  @state() _endDate?: Date;

  private _statTypes?: StatisticType[];

  private _period: "5minute" | "hour" | "day" | "week" | "month" = "week";

  private _interval?: number;

  public connectedCallback(): void {
    super.connectedCallback();
    if (this._config) {
      this._setFetchStatisticsTimer();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    await import("./stat-table-card-editor");
    return document.createElement("statistics-table-card-editor");
  }

  setConfig(config: StatisticsTableCardConfig): void {
    if (!config || !config.entity) {
      throw new Error("Invalid configuration: entity is required");
    }

    if (config.start_date) {
      this._startDate = new Date(config.start_date);
    } else {
      this._startDate = new Date();
      this._startDate.setMonth(this._startDate.getMonth() - 1); // Default to last month
    }
    if (config.end_date) {
      this._endDate = new Date(config.end_date);
    } else {
      this._endDate = new Date(); // Default to now
    }

    if (config.period) {
      this._period = config.period;
    }

    if (typeof config.statistics_type === "string") {
      this._statTypes = [config.statistics_type];
    } else if (!config.statistics_type) {
      this._statTypes = ["change", "state", "sum", "min", "max", "mean"];
    } else {
      this._statTypes = config.statistics_type;
    }
    this._config = config;
  }

  private _setFetchStatisticsTimer() {
    this._getStatistics();
    // statistics are created every hour
    clearInterval(this._interval);
    if (!this._config?.energy_date_selection) {
      this._interval = window.setInterval(
        () => this._getStatistics(),
        this._intervalTimeout
      );
    }
  }

  private get _intervalTimeout(): number {
    return (this._config?.period === "5minute" ? 5 : 60) * 1000 * 60;
  }

  private async _getStatistics(): Promise<void> {
    const startDate = this._startDate || new Date();
    const endDate = this._endDate || new Date();
    try {
      const statistics = await fetchStatistics(
        this.hass!,
        startDate,
        endDate,
        [this._config!.entity],
        this._period,
        undefined,
        this._statTypes
      )
      this._statistics = statistics;
      console.log("got");
    } catch (error) {
      this._statistics = undefined;
    }
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    // console.log(this._statistics)

    const formatter = new Intl.DateTimeFormat(this.hass.language, { month: 'long' });

    return html`
      <ha-card>
      ${this._config.title
        ? html`
        <h1 class="card-header">
          ${this._config.title}
        </h1>`
        : ""}
        <div class="card-content">
          ${this._statistics
            ? html`
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      ${this._statTypes!.map(
                        (type) => html`<th>${type}</th>`
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(this._statistics).map(
                      ([_, values]) => html`
                        ${values.map((value) => html`
                          <tr>
                            <td>
                              ${formatter.format(value.start)}
                            </td>
                            ${this._statTypes!.map((type) => {
                              const statValue = value[type] || 0;
                              return html`
                                <td>
                                  ${statValue.toFixed(1)} ${this._config!.unit || ""}
                                </td>
                              `;
                            })}
                          </tr>
                        `)}
                      `
                    )}
                  </tbody>
                </table>
              `
            : html`<p>No statistics available.</p>`}
        </div>
      </ha-card>
      `;
  }

  static get styles() {
    return css`
      ha-card {
        width: 100%;
        height: 100%;
        display: flex;
        padding: 10px;
        flex-direction: column;
        align-items: center;
      }
      .card-content {
        padding: 0;
        border-radius: var(--ha-card-border-radius, 12px) var(--ha-card-border-radius, 12px) 0 0;
        overflow: hidden;
      }
      table {
        border-spacing: 0px;
      }
      table, .card-content {
        width: 100%;
        height: 100%;
      }
      thead tr {
        background-color: var(--table-row-alternative-background-color);
      }
      thead th {
        box-sizing: border-box;
        padding: 6px 16px;
        border-bottom: 1px solid var(--divider-color);
      }
      tbody tr {
        border-bottom: 1px solid var(--divider-color);
      }
      tr td {
        padding: 6px 16px;
        box-sizing: border-box;
        border-bottom: 1px solid var(--divider-color);
      }
    `;
  }
}