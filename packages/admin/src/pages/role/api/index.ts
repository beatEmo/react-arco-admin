import { PaginationProps } from '@arco-design/web-react';
import { Result } from '@/api/types';
import http from '@/utils/http';

const url = '/api/role';

export interface Role {
  _id: string;
  name: string;
  permissions?: Record<string, string[]>;
}

export const initial = {
  _id: '',
  name: '',
  permissions: {},
};

export async function getAllRoles() {
  const { data } = await http.get<Result<Role>>(url);
  return data;
}

export async function getRoleList({ current, pageSize }: PaginationProps) {
  const { data, meta } = await http.get<Result<Role>>(url, {
    params: {
      page: current,
      pageSize: pageSize,
    },
  });
  return { list: data, total: meta.total };
}

export function addRole(role: Role) {
  Reflect.deleteProperty(role, '_id');
  return http.post<Result<Role>>(url, role);
}

export function deleteRole(id: string) {
  return http.delete(`${url}/${id}`);
}

export function updateRole(role: Role) {
  return http.patch(`${url}/${role._id}`, role);
}
