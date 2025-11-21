import { defineStore } from "pinia";
import { type Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useUserStore } from "../stores/User";

const client = generateClient<Schema>();

export const useRecordingSummaryStore = defineStore("recording-summary", {
  state: () => ({
    recordingSummaries: [] as any[],
    recordingSummary: null as any | null,
    nextToken: null as string | null,
    limitSummary: 25,
    sortDirection: "DESC" as "ASC" | "DESC",
    metrics: {
      totalSummaries: 0,
      totalMinutes: 0,
    },
  }),

  actions: {
    updateRecordyngSummaryListener(recordingSummary: any) {
      const index = this.recordingSummaries.findIndex(
        (summary) => summary.id === recordingSummary.id,
      );
      if (index !== -1) {
        this.recordingSummaries[index] = recordingSummary;
      }
    },
    deleteRecordingSummaryListener(recordingSummaryId: string) {
      this.recordingSummaries = this.recordingSummaries.filter(
        (summary) => summary.id !== recordingSummaryId,
      );
    },
    resetRecordingSummary() {
      this.recordingSummary = null;
    },
    setSortDirection(direction: "ASC" | "DESC") {
      this.sortDirection = direction;
      this.nextToken = null;
    },
    async getRecordingSummaries() {
      try {
        const user = useUserStore();

        const { data, nextToken, errors } =
          await client.models.RecordingSummary.listByUserId(
            { userId: user.userId },
            {
              limit: this.limitSummary,
              sortDirection: this.sortDirection,
            },
          );

        this.nextToken = nextToken || null;

        if (errors && errors.length > 0) {
          throw new Error(errors[0].message);
        }

        this.recordingSummaries = data || [];

        return {
          error: false,
          message: "Recording summaries fetched successfully",
          data: this.recordingSummaries,
        };
      } catch (err: any) {
        return {
          error: true,
          message: err.message || "Error fetching recording summaries",
        };
      }
    },
    async loadMoreRecordingSummaries() {
      if (!this.nextToken) {
        return { error: false, message: "No more data" };
      }

      try {
        const user = useUserStore();

        const { data, nextToken, errors } =
          await client.models.RecordingSummary.listByUserId(
            { userId: user.userId },
            {
              limit: this.limitSummary,
              nextToken: this.nextToken,
              sortDirection: this.sortDirection,
            },
          );

        this.nextToken = nextToken || null;

        if (errors && errors.length > 0) {
          throw new Error(errors[0].message);
        }

        this.recordingSummaries = [...this.recordingSummaries, ...(data || [])];

        return {
          error: false,
          message: "More summaries loaded",
          data: this.recordingSummaries,
        };
      } catch (err: any) {
        return {
          error: true,
          message: err.message || "Error loading more summaries",
        };
      }
    },
    async getRecordSummaryById(recordingSummaryId: string) {
      try {
        const { data, errors } = await client.models.RecordingSummary.get({
          id: recordingSummaryId,
        });
        if (errors && errors.length > 0) {
          throw new Error(errors[0].message);
        }
        this.recordingSummary = data || null;
        if (!this.recordingSummary) {
          return {
            error: true,
            message: "Recording summary not found",
          };
        }
        return {
          error: false,
          message: "Recording summary fetched successfully",
          data: this.recordingSummary,
        };
      } catch (err: any) {
        return {
          error: true,
          message: err.message || "Error fetching recording summary",
        };
      }
    },
    async deleteRecordingSummary(recordingSummaryId: string) {
      try {
        const { errors } = await client.models.RecordingSummary.delete({
          id: recordingSummaryId,
        });

        if (errors && errors.length > 0) {
          throw new Error(errors[0].message);
        }

        this.recordingSummaries = this.recordingSummaries.filter(
          (summary) => summary.id !== recordingSummaryId,
        );

        return {
          error: false,
          message: "Recording summary deleted successfully",
        };
      } catch (err: any) {
        return {
          error: true,
          message: err.message || "Error deleting recording summary",
        };
      }
    },
    calculateMonthlyMetrics() {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyRecordings = this.recordingSummaries.filter((recording) => {
        const recordingDate = new Date(recording.createdAt);
        return (
          recordingDate.getMonth() === currentMonth &&
          recordingDate.getFullYear() === currentYear
        );
      });

      this.metrics.totalSummaries = monthlyRecordings.length;
      this.metrics.totalMinutes = Math.round(
        monthlyRecordings.reduce((acc, recording) => {
          return acc + (recording.audioDuration || 0);
        }, 0) / 60,
      );
    },
  },
});
