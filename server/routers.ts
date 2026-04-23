import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createFilament,
  deleteFilament,
  getFilamentById,
  getFilamentsByUser,
  getFilamentStats,
  updateFilament,
} from "./db";

const filamentInput = z.object({
  brand: z.string().min(1),
  productLine: z.string().optional(),
  materialFamily: z.string().min(1),
  materialSubtype: z.string().optional(),
  colorName: z.string().optional(),
  colorHex: z.string().default("#888888"),
  advertisedWeight: z.number().positive().optional(),
  spoolType: z.string().optional(),
  spoolMaterial: z.string().optional(),
  measurementMethod: z.enum(["empty_spool", "full_spool"]).default("empty_spool"),
  emptySpoolWeight: z.number().positive().optional(),
  fullSpoolWeight: z.number().positive().optional(),
  currentTotalWeight: z.number().positive().optional(),
  purchaseLink: z.string().optional(),
  supplier: z.string().optional(),
  price: z.number().positive().optional(),
  datePurchased: z.date().optional(),
  storageLocation: z.string().optional(),
  isDryBox: z.boolean().default(false),
  lastDriedAt: z.date().optional(),
  notes: z.string().optional(),
  customLabels: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  filaments: router({
    list: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        brand: z.string().optional(),
        material: z.string().optional(),
        lowStock: z.boolean().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getFilamentsByUser(ctx.user.id, input ?? {});
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getFilamentById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(filamentInput)
      .mutation(async ({ ctx, input }) => {
        await createFilament(ctx.user.id, {
          ...input,
          advertisedWeight: input.advertisedWeight?.toString() as any,
          emptySpoolWeight: input.emptySpoolWeight?.toString() as any,
          fullSpoolWeight: input.fullSpoolWeight?.toString() as any,
          currentTotalWeight: input.currentTotalWeight?.toString() as any,
          price: input.price?.toString() as any,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number() }).merge(filamentInput.partial()))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await updateFilament(id, ctx.user.id, {
          ...data,
          advertisedWeight: data.advertisedWeight?.toString() as any,
          emptySpoolWeight: data.emptySpoolWeight?.toString() as any,
          fullSpoolWeight: data.fullSpoolWeight?.toString() as any,
          currentTotalWeight: data.currentTotalWeight?.toString() as any,
          price: data.price?.toString() as any,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteFilament(input.id, ctx.user.id);
        return { success: true };
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return getFilamentStats(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
