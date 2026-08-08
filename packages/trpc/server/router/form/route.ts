import { z } from "zod";
import { formService } from "../../services";
import {
  protectedProcedure,
  publicProcedure,
  router,
  TRPCError,
} from "../../trpc";
import {
  createFormInput,
  createLogicRuleRouteInput,
  createQuestionInput,
  createQuestionOptionInput,
  createSectionRouteInput,
  formDetailOutput,
  formOutput,
  formSettingsOutput,
  idInput,
  logicRuleOutput,
  okOutput,
  optionIdInput,
  questionOptionOutput,
  questionOutput,
  reorderOptionsRouteInput,
  reorderQuestionsRouteInput,
  reorderSectionsRouteInput,
  ruleIdInput,
  sectionOutput,
  setFormStatusRouteInput,
  updateFormRouteInput,
  updateFormSettingsRouteInput,
  updateLogicRuleRouteInput,
  updateOptionRouteInput,
  updateQuestionRouteInput,
  updateSectionRouteInput,
} from "./model";

function toTrpcError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "Form request failed";
  const notFound =
    message.toLowerCase().includes("not found") ||
    message.toLowerCase().includes("not accepting") ||
    message.toLowerCase().includes("expired");
  throw new TRPCError({
    code: notFound ? "NOT_FOUND" : "BAD_REQUEST",
    message,
  });
}

export const formRouter = router({
  createForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/forms",
        tags: ["forms"],
        summary: "Create a form",
        protect: true,
      },
    })
    .input(createFormInput)
    .output(formDetailOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.createForm(ctx.userId, input);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listForms: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms",
        tags: ["forms"],
        summary: "List owned forms",
        protect: true,
      },
    })
    .output(z.array(formOutput))
    .query(async ({ ctx }) => {
      try {
        return await formService.listForms(ctx.userId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getFormById: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{id}",
        tags: ["forms"],
        summary: "Get form with sections, questions, and logic",
        protect: true,
      },
    })
    .input(idInput)
    .output(formDetailOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await formService.getFormById(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getPublishedFormById: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/published/{id}",
        tags: ["forms"],
        summary: "Get a published form for respondents",
      },
    })
    .input(idInput)
    .output(formDetailOutput)
    .query(async ({ input }) => {
      try {
        return await formService.getPublishedFormById(input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateForm: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/forms/{id}",
        tags: ["forms"],
        summary: "Update form metadata",
        protect: true,
      },
    })
    .input(updateFormRouteInput)
    .output(formDetailOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        return await formService.updateForm(ctx.userId, id, data);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateFormSettings: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/forms/{formId}/settings",
        tags: ["forms"],
        summary: "Update form settings",
        protect: true,
      },
    })
    .input(updateFormSettingsRouteInput)
    .output(formSettingsOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { formId, ...data } = input;
        return await formService.updateFormSettings(ctx.userId, formId, data);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  setFormStatus: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/forms/{id}/status",
        tags: ["forms"],
        summary: "Set form status (draft/publish/archive/close)",
        protect: true,
      },
    })
    .input(setFormStatusRouteInput)
    .output(formOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        return await formService.setFormStatus(ctx.userId, id, data);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteForm: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/forms/{id}",
        tags: ["forms"],
        summary: "Soft-delete a form",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteForm(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  createSection: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/forms/{formId}/sections",
        tags: ["forms"],
        summary: "Create a section",
        protect: true,
      },
    })
    .input(createSectionRouteInput)
    .output(sectionOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { formId, ...data } = input;
        return await formService.createSection(ctx.userId, formId, data);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateSection: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/sections/{id}",
        tags: ["forms"],
        summary: "Update a section",
        protect: true,
      },
    })
    .input(updateSectionRouteInput)
    .output(sectionOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        return await formService.updateSection(ctx.userId, id, data);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteSection: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/sections/{id}",
        tags: ["forms"],
        summary: "Soft-delete a section",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteSection(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  reorderSections: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/forms/{formId}/sections/reorder",
        tags: ["forms"],
        summary: "Reorder sections",
        protect: true,
      },
    })
    .input(reorderSectionsRouteInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { formId, ...data } = input;
        return await formService.reorderSections(ctx.userId, formId, data);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  createQuestion: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/questions",
        tags: ["forms"],
        summary: "Create a question (optional options)",
        protect: true,
      },
    })
    .input(createQuestionInput)
    .output(questionOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const question = await formService.createQuestion(ctx.userId, input);
        if (!question) {
          throw new Error("Failed to create question");
        }
        return question;
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateQuestion: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/questions/{id}",
        tags: ["forms"],
        summary: "Update a question",
        protect: true,
      },
    })
    .input(updateQuestionRouteInput)
    .output(questionOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        const question = await formService.updateQuestion(
          ctx.userId,
          id,
          data,
        );
        if (!question) {
          throw new Error("Failed to update question");
        }
        return question;
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteQuestion: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/questions/{id}",
        tags: ["forms"],
        summary: "Soft-delete a question",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteQuestion(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  reorderQuestions: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/sections/{sectionId}/questions/reorder",
        tags: ["forms"],
        summary: "Reorder questions in a section",
        protect: true,
      },
    })
    .input(reorderQuestionsRouteInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { sectionId, ...data } = input;
        return await formService.reorderQuestions(ctx.userId, sectionId, data);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  createQuestionOption: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/question-options",
        tags: ["forms"],
        summary: "Create a question option",
        protect: true,
      },
    })
    .input(createQuestionOptionInput)
    .output(questionOptionOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.createQuestionOption(ctx.userId, input);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateQuestionOption: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/question-options/{optionId}",
        tags: ["forms"],
        summary: "Update a question option",
        protect: true,
      },
    })
    .input(updateOptionRouteInput)
    .output(questionOptionOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { optionId, ...data } = input;
        return await formService.updateQuestionOption(
          ctx.userId,
          optionId,
          data,
        );
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteQuestionOption: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/question-options/{optionId}",
        tags: ["forms"],
        summary: "Soft-delete a question option",
        protect: true,
      },
    })
    .input(optionIdInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteQuestionOption(
          ctx.userId,
          input.optionId,
        );
      } catch (error) {
        toTrpcError(error);
      }
    }),

  reorderQuestionOptions: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/questions/{questionId}/options/reorder",
        tags: ["forms"],
        summary: "Reorder question options",
        protect: true,
      },
    })
    .input(reorderOptionsRouteInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { questionId, ...data } = input;
        return await formService.reorderQuestionOptions(
          ctx.userId,
          questionId,
          data,
        );
      } catch (error) {
        toTrpcError(error);
      }
    }),

  createLogicRule: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/forms/{formId}/logic-rules",
        tags: ["forms"],
        summary: "Create a logic rule",
        protect: true,
      },
    })
    .input(createLogicRuleRouteInput)
    .output(logicRuleOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { formId, ...data } = input;
        return await formService.createLogicRule(ctx.userId, formId, data);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateLogicRule: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/logic-rules/{ruleId}",
        tags: ["forms"],
        summary: "Update a logic rule",
        protect: true,
      },
    })
    .input(updateLogicRuleRouteInput)
    .output(logicRuleOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { ruleId, ...data } = input;
        return await formService.updateLogicRule(ctx.userId, ruleId, data);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteLogicRule: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/logic-rules/{ruleId}",
        tags: ["forms"],
        summary: "Soft-delete a logic rule",
        protect: true,
      },
    })
    .input(ruleIdInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteLogicRule(ctx.userId, input.ruleId);
      } catch (error) {
        toTrpcError(error);
      }
    }),
});
