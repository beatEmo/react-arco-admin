import React, { useMemo } from 'react';
import { Drawer, Form, Input, Message, Select } from '@arco-design/web-react';
import { User } from '.';
import AvatarUploader from './components/AvatarUploader';
import { useRequest } from 'ahooks';
import { getAllRoles } from '../role/api';

type FormProps = {
  visible: boolean;
  setVisible: (b: boolean) => void;
  editedItem: User;
  callback?: (data: Partial<User>) => void;
};

const name = '用户信息';

const addTableData = async (data: Partial<User>) => {
  const newItem = await fetch(`/api/user`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  }).then((res) => res.json());
  return { ok: newItem && newItem._id, data: newItem };
};
const updateTableData = async (id: string, data: Partial<User>) => {
  const { data: result } = await fetch(`/api/user/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  }).then((res) => res.json());
  return { ok: result && result.affected === 1 };
};

function UserForm({ visible, setVisible, editedItem, callback }: FormProps) {
  const [form] = Form.useForm();

  const title = useMemo(
    () => (editedItem._id ? '更新' : '新增') + name,
    [editedItem._id]
  );

  const { data: roles, run } = useRequest(getAllRoles, { manual: true });

  const rolesOptions = useMemo(() => {
    if (roles) {
      return roles.map((role) => ({
        label: role.name,
        value: role._id,
      }));
    }
    return [];
  }, [roles]);

  const onSubmit = () => {
    form.validate(async (errors) => {
      if (!errors) {
        const operation = editedItem._id ? '编辑' : '新增';
        if (editedItem._id) {
          const values = form.getFieldsValue();
          const { ok } = await updateTableData(editedItem._id, values);
          if (ok) {
            callback && callback(form.getFieldsValue());
            Message.success(operation + '用户成功!');
            setVisible(false);
          } else {
            Message.error(operation + '用户失败，请重试!');
          }
        } else {
          const editedItem = form.getFieldsValue();
          console.log(editedItem);
          const { ok, data } = await addTableData(editedItem);
          if (ok) {
            callback && callback(data);
            Message.success(operation + '用户成功!');
            setVisible(false);
          } else {
            Message.error(operation + '用户失败，请重试!');
          }
        }
      }
    });
  };

  return (
    <Drawer
      width={450}
      title={title}
      visible={visible}
      onOk={onSubmit}
      onCancel={() => {
        setVisible(false);
      }}
      afterOpen={() => {
        form.setFieldsValue(editedItem);
        if (!roles) {
          run();
        }
      }}
      afterClose={() => {
        form.resetFields();
      }}
    >
      <Form form={form}>
        <Form.Item
          label="手机号"
          field="phoneNumber"
          rules={[
            { required: true, message: '手机号是必填项' },
            { match: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item
          label="用户名称"
          field="name"
          rules={[{ required: true, message: '用户名是必填项' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          label="角色"
          field="role"
          rules={[{ required: true, message: '角色是必填项' }]}
        >
          <Select placeholder="请选择角色" options={rolesOptions}></Select>
        </Form.Item>
        <Form.Item label="头像" field="avatar">
          <AvatarUploader {...{ visible }} />
        </Form.Item>
        <Form.Item label="邮箱" field="email">
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item label="组织" field="organization">
          <Input placeholder="请输入组织名称" />
        </Form.Item>
        <Form.Item label="职位" field="job">
          <Input placeholder="请输入职位" />
        </Form.Item>
        <Form.Item label="个人站点" field="personalWebsite">
          <Input placeholder="请输入个人站点URL" />
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default UserForm;
