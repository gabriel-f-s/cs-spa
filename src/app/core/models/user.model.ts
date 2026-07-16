import { PageInformation } from './pagination.model';
import { UserStatus } from '../enums/user-status.enum';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: string;
  forcePasswordChange: boolean;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUser {
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  active?: boolean;
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

export interface PaginatedUsers {
  content: UserSummary[];
  page: PageInformation;
}
