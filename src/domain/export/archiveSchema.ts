import { z } from 'zod'

export const FitileArchiveSchema = z.object({
  format: z.literal('fittile-archive'),
  version: z.string().refine((version) => /^1\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version), 'Unsupported Fitile archive version'),
  createdAt: z.iso.datetime(),
  data: z.object({
    workouts: z.array(z.unknown()),
    meals: z.array(z.unknown()),
    activities: z.array(z.unknown()),
    measurements: z.array(z.unknown()),
    settings: z.record(z.string(), z.unknown()),
  }).passthrough(),
})

export type FitileArchive = z.infer<typeof FitileArchiveSchema>
