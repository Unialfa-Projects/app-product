import { z } from 'zod';

export const usuarioCadastroSchema = z.object({
  nome: z.string().trim().min(3, 'Informe seu nome').max(60, 'Nome muito longo'),
  email: z.string().trim().toLowerCase().email('E-mail inválido').max(100),
  senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres').max(72), // RN14
}).strict();

export const usuarioLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
}).strict();
