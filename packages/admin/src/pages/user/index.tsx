import React, { useEffect, useState } from 'react';
import { usePagination } from 'ahooks';
import {
  Card,
  Space,
  Button,
  Typography,
  Table,
  Popconfirm,
  TableColumnProps,
  Message,
} from '@arco-design/web-react';
import DrawerForm from './form';
import PermissionWrapper from '@/components/PermissionWrapper';

const { Title } = Typography;

const getTableData = async ({ current, pageSize }) => {
  const {
    data: list,
    meta: { total },
  } = await fetch(`/api/user?pageSize=${pageSize}&page=${current}`).then(
    (res) => res.json()
  );
  return { list, total };
};

const deleteTableData = async (id) => {
  const res = await fetch(`/api/user/${id}`, { method: 'DELETE' }).then((res) =>
    res.json()
  );
  return { ok: res.affected === 1 };
};

export const initial = {
  _id: '',
  phoneNumber: '',
  password: '',
  name: '',
  avatar: '',
  email: '',
  job: '',
  jobName: '',
  organization: '',
  location: '',
  personalWebsite: '',
};
export type User = typeof initial;

const UserPage = () => {
  const { data, pagination, loading, refresh } = usePagination(getTableData, {
    defaultCurrent: 1,
    defaultPageSize: 2,
  });

  const columns: TableColumnProps[] = [
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
    },
    {
      title: '用户名称',
      dataIndex: 'name',
    },
    {
      title: '用户头像',
      dataIndex: 'avatar',
      render(value: string) {
        return <img src={value} width="50" />;
      },
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      placeholder: '-',
    },
    {
      title: '操作',
      dataIndex: 'operations',
      render: (_: unknown, record) => (
        <>
          <PermissionWrapper
            requiredPermissions={[
              { resource: 'role', actions: ['read', 'write'] },
            ]}
          >
            <Button
              type="text"
              size="small"
              onClick={() => tableCallback(record, 'edit')}
            >
              编辑
            </Button>
            <Popconfirm
              focusLock
              title="确认删除吗?"
              okText="确认"
              cancelText="取消"
              onOk={() => tableCallback(record, 'delete')}
            >
              <Button type="text" size="small">
                删除
              </Button>
            </Popconfirm>
          </PermissionWrapper>
        </>
      ),
    },
  ];
  const tableCallback = async (record, operation) => {
    if (operation === 'delete') {
      const { ok } = await deleteTableData(record._id);
      if (ok) {
        Message.success('删除成功');
        refresh();
      } else {
        Message.error('删除失敗');
      }
    } else {
      setEditedItem(record);
      setVisible(true);
    }
  };

  const [visible, setVisible] = useState(false);
  const [editedItem, setEditedItem] = useState<User>(initial);
  const onAdd = () => {
    setEditedItem(initial);
    setVisible(true);
  };

  return (
    <Card>
      <Title heading={6}>用户管理</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button type="primary" onClick={onAdd}>
          新增用户
        </Button>
        <Table
          data={data?.list}
          loading={loading}
          columns={columns}
          pagination={pagination}
          rowKey="_id"
          style={{ width: '100%' }}
        ></Table>
      </Space>
      <DrawerForm
        {...{ visible, setVisible, editedItem, callback: () => refresh() }}
      ></DrawerForm>
    </Card>
  );
};

export default UserPage;
