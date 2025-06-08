import { defineStore } from "pinia";
import { type Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useUserStore } from "../stores/User";

const client = generateClient<Schema>();

export const useRecordingSummaryStore = defineStore("recording-summary", {
  state: () => ({
    recordingSummaries: [] as any[],
  }),

  actions: {
    addRecordingSummaryListener(recordingSummary: any) {
      this.recordingSummaries.push(recordingSummary);
    },
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
    async getRecordingSummaries() {
      try {
        // Mover la inicialización del store aquí, dentro de la action
        const user = useUserStore();

        const { data, errors } =
          await client.models.RecordingSummary.listByUserId({
            userId: user.userId,
          });

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
  },
});
