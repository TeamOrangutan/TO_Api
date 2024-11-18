import {z} from 'zod'

export const SignupSchema = z.object({
    correo: z.string().email(),
    contrasena: z.string(),
    nombre: z.string().nonempty(), 
    rol_fk: z.number().int().positive().optional()
})