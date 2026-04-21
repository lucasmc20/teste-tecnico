export interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemInput {
  name: string;
  description: string | null;
  price: number;
  stock: number;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorPayload {
  error: string;
  message: string;
  details?: ApiErrorDetail[];
}
