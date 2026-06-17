export enum UserRole {
  RESEARCHER = 'researcher',
  IMAGING_EXPERT = 'imaging_expert',
  APPROVER = 'approver',
  CHIEF_SCIENTIST = 'chief_scientist',
  ADMIN = 'admin',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.RESEARCHER]: '研究员',
  [UserRole.IMAGING_EXPERT]: '成像专家',
  [UserRole.APPROVER]: '审批人',
  [UserRole.CHIEF_SCIENTIST]: '首席科学家',
  [UserRole.ADMIN]: '系统管理员',
};

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}
