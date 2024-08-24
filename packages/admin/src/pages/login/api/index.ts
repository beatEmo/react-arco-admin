import { OpResult } from '@/api/types';
import http from '@/utils/http';
import axios from 'axios';

type Result<T> = {
  data: T;
  meta: Record<string, string>;
};

export interface UserInfo {
  name: string;
  avatar?: string;
  email?: string;
  phoneNumber: string;
  role: string;
  job?: string;
  jobName?: string;
  organization?: string;
  location?: string;
  personalWebsite?: string;
  permissions: Record<string, string[]>;
}

const url = '/api/auth';

export const userLogin = async (params) => {
  const { data } = await http.post<OpResult<{ token: string }>>(
    `${url}/login`,
    params
  );
  return data;
};

export async function getUserInfo() {
  const res = await http.get<Result<UserInfo>>(`/api/auth/info`);
  return res.data;
}
