import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  companyName: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải đồng ý với điều khoản sử dụng',
  }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createLeadKitSchema = z.object({
  serviceName: z.string().min(1, 'Dịch vụ không được để trống'),
  targetIndustry: z.string().min(1, 'Ngành không được để trống'),
  targetLocation: z.string().min(1, 'Địa điểm không được để trống'),
  leadCount: z.union([z.literal(10), z.literal(50), z.literal(100)]),
  sellerGoal: z.string().optional(),
  offerAngle: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateLeadKitInput = z.infer<typeof createLeadKitSchema>;
