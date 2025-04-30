import { z } from 'zod';

export const cvSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(15).max(60),
  cin: z.number(),
  job: z.string().min(1),
  path: z.string().min(1),
  description: z.string().min(1),
});
export const CvArraySchema = z.array(cvSchema);
export type TCv = z.infer<typeof cvSchema>;
