// Zod valida o JSON antes que os dados cheguem às consultas SQL.
import { z } from 'zod';

// Corpo usado para cadastrar um usuário. Sem hash de senha (bcrypt) e sem
// token (JWT) de propósito: este projeto usa uma verificação bem simples.
export const criarUsuarioSchema = z.object({
  // Nome é obrigatório e cabe em varchar(60).
  nome: z.string().trim().min(1).max(60),
  // Email vira minúsculo para o login não depender de maiúscula/minúscula.
  email: z.string().trim().toLowerCase().email().max(100),
  // senha cabe em varchar(50); sem hash, então o tamanho salvo é o tamanho digitado.
  senha: z.string().min(4).max(50),
  // Rejeita campos que não existem na tabela usuario.
}).strict();

// Corpo usado no login: só email e senha.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(100),
  senha: z.string().min(1).max(50),
}).strict();
