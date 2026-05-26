'use client';

import { Avatar, Dropdown, type MenuProps } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { clearAuth } from '@/lib/features/auth/authSlice';
import { logoutRequest } from '@/lib/features/auth/authApi';

export default function UserMenu() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  async function handleLogout() {
    await logoutRequest();
    dispatch(clearAuth());
    router.replace('/login');
  }

  // Get initials for avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TM';

  const items: MenuProps['items'] = [
    {
      key: 'email',
      label: (
        <span style={{ color: 'var(--ant-text-3)', fontSize: 12 }}>
          {user?.email ?? ''}
        </span>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'ออกจากระบบ',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <Avatar
        style={{
          background: 'var(--ant-primary)',
          cursor: 'pointer',
          fontWeight: 600,
          flexShrink: 0,
        }}
        size={32}
        aria-label="เมนูผู้ใช้งาน"
      >
        {initials}
      </Avatar>
    </Dropdown>
  );
}
