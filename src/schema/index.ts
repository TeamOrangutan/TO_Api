import {z} from 'zod'

export const schemaProduct = z.object({
    name: z.string(),
    categoryId: z.number()
})