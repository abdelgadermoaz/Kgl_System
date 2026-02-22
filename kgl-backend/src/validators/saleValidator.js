import { z } from 'zod';

export const createSaleSchema = z.object({
  saleType: z.enum(['CASH', 'CREDIT']),
  produceName: z.string().min(1, "Produce name is required"),
  tonnageKg: z.number().positive("Tonnage must be greater than 0"),
  unitPriceUgx: z.number().positive("Unit price must be greater than 0"),
  buyerName: z.string().min(1, "Buyer name is required"),
  nationalIdNIN: z.string().optional(),
  amountPaidUgx: z.number().min(0, "Amount paid cannot be negative"),
  dueDate: z.string().datetime().optional(),
  branch: z.string().min(1, "Branch is required"),
}).superRefine((data, ctx) => {
  if (data.saleType === 'CREDIT' && !data.nationalIdNIN) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NIN is required for CREDIT sales", path: ["nationalIdNIN"] });
  }
  if (data.saleType === 'CREDIT' && !data.dueDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Due date is required for CREDIT sales", path: ["dueDate"] });
  }
});