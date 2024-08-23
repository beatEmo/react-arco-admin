import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Table,
  Drawer,
  Popconfirm,
  Form,
  Input,
  Message,
  Tree,
  Checkbox,
} from '@arco-design/web-react';
import { usePagination } from 'ahooks';
import {
  addRole,
  deleteRole,
  getRoleList,
  initial,
  Role,
  updateRole,
} from './api';
import { IRoute, routes } from '@/routes';
import useLocale from '@/utils/useLocale';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import useCheckbox from '@arco-design/web-react/es/Checkbox/useCheckbox';

const { Title, Text } = Typography;
const FormItem = Form.Item;

let authSelectResult: { [key: string]: string[] } = {};

// 深度递归遍历路由表获得权限树
// 传入深度递归遍历的路由表 和 国际化对象
function generateMenus(routes: IRoute[], t: Record<string, string>) {
  return routes.map((route) => {
    const item: TreeDataType = {
      title: t[route.name],
      key: route.key,
    };
    if (route.children) {
      item.children = generateMenus(route.children, t);
    }
    return item;
  });
}

const RolePage = () => {
  const [editedItem, setEditedItem] = useState<Role>(initial);
  const onAdd = () => {
    setDrawerVisible(true);
    setEditedItem(initial);
  };

  const t = useLocale();
  const menus = generateMenus(routes, t);

  const RenderAuthTree = (node: TreeDataType) => {
    const options = ['read', 'write'];
    // 通过useCheckbox 快捷使用Checkbox
    const { selected, setSelected } = useCheckbox(options);

    // 这里也是页面首次渲染时，设置一下checkboxes的默认值
    useEffect(() => {
      // 当前角色存在权限时
      if (editedItem.permissions) {
        // 根据编辑中角色的permissions，设置选中状态
        setSelected(editedItem.permissions[node.dataRef.key]);
        // 记录权限选择结果
        if (editedItem.permissions[node.dataRef.key]) {
          authSelectResult[node.dataRef.key] =
            editedItem.permissions[node.dataRef.key];
        }
      }
    }, [editedItem.permissions]);

    return (
      <Checkbox.Group
        value={selected}
        options={options}
        onChange={(value) => {
          if (value.length) {
            authSelectResult[node._key] = value;
          } else {
            Reflect.deleteProperty(authSelectResult, node._key);
          }
          setSelected(value);
        }}
      />
    );
  };

  const onEditedItemChange = (key: string, value: unknown) => {
    setEditedItem({ ...editedItem, [key]: value });
  };

  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerTitle = useMemo(
    () => (editedItem._id ? '编辑角色' : '新增角色'),
    [editedItem._id]
  );
  const onSubmit = async () => {
    const isEdit = editedItem._id ? true : false;
    let message: string = isEdit ? '编辑' : '新增';

    try {
      editedItem.permissions = authSelectResult;

      if (isEdit) {
        await updateRole(editedItem);
      } else {
        await addRole(editedItem);
      }

      message += '成功';
      Message.success(message);
      setDrawerVisible(false);
      refresh();
    } catch (error) {
      message += '失败';
      Message.error(message);
    }
  };
  const afterDrawerClose = () => {
    authSelectResult = {};
  };

  const { data, loading, pagination, refresh } = usePagination(getRoleList, {
    defaultCurrent: 1,
    defaultPageSize: 10,
  });

  const tableCallback = async (record: Role, action: string) => {
    console.log(record, action);
    if (action === 'edit') {
      setDrawerVisible(true);
      setEditedItem(record);
    } else {
      try {
        await deleteRole(record._id);
        Message.success('删除成功');
        const { current, total, changeCurrent } = pagination;
        if (total > 0 && data.list.length === 1 && current > 1) {
          changeCurrent(current - 1);
        } else {
          refresh();
        }
      } catch (error) {
        Message.error('删除失败');
      }
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      render: (value: string) => <Text copyable>{value}</Text>,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '操作',
      dataIndex: 'operations',
      render: (_: unknown, record: Role) => (
        <>
          <Button
            type="text"
            size="small"
            onClick={() => tableCallback(record, 'edit')}
          >
            编辑权限
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
        </>
      ),
    },
  ];
  return (
    <>
      <Card>
        <Title heading={6}>用户管理</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="primary" onClick={onAdd}>
            新增角色
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
        <Drawer
          width={400}
          title={drawerTitle}
          visible={drawerVisible}
          onOk={onSubmit}
          okText="提交"
          onCancel={() => setDrawerVisible(false)}
          cancelText="取消"
          afterClose={afterDrawerClose}
        >
          <Form autoComplete="off">
            <FormItem label="ID">
              <Text>{editedItem._id}</Text>
            </FormItem>
            <FormItem label="角色名称">
              <Input
                value={editedItem.name}
                onChange={(value: string) => onEditedItemChange('name', value)}
              />
            </FormItem>
            <FormItem label="权限设置">
              <Tree
                treeData={menus}
                blockNode
                renderExtra={RenderAuthTree}
              ></Tree>
            </FormItem>
          </Form>
        </Drawer>
      </Card>
    </>
  );
};

export default RolePage;
