import { useState } from "react";
import { Avatar, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Switch, Table, Tag, message } from "antd";
import { CanAccess, useCreate, useCustomMutation, useDelete, useList, useUpdate } from "@refinedev/core";
import { TranslationOutlined } from '@ant-design/icons';
import { useTable } from "@/utils/core";
import { Header } from '@/components/table/Header';
import { Unauthorized } from '@/components/Unauthorized';

type LanguageRow = {
  code: string;
  name: string;
  native_name?: string | null;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
};

type PresetRow = {
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  weekStart: 0 | 1;
  added: boolean;
};

const flag = (code: string, size = 20) => (
  <Avatar
    size={size}
    shape="square"
    alt={code}
    src={`/media/img/flags/lang-${code}.svg`}
  >
    {code.slice(0, 2).toUpperCase()}
  </Avatar>
);

const RESOURCE = 'admin/languages';

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LanguageRow | null>(null);
  const [form] = Form.useForm();
  const [messageApi, messageHolder] = message.useMessage();

  const { tableProps, tableQuery } = useTable<LanguageRow>({
    resource: RESOURCE,
    pagination: { mode: 'off' },
    syncWithLocation: false,
  });

  const { query: presetsQuery, result: presetsResult } = useList<PresetRow>({
    resource: 'admin/language-presets',
    pagination: { mode: 'off' },
  });

  const { mutate: createLang, mutation: createMutation } = useCreate();
  const { mutate: updateLang, mutation: updateMutation } = useUpdate();
  const { mutate: deleteLang } = useDelete();
  const { mutate: runCustom, mutation: customMutation } = useCustomMutation();
  const saving = createMutation.isPending || updateMutation.isPending || customMutation.isPending;

  const presets: PresetRow[] = (presetsResult?.data as PresetRow[] | undefined) ?? [];

  const reload = () => {
    tableQuery.refetch();
    presetsQuery.refetch();
  };

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true });
    setModalOpen(true);
  };

  const openEdit = (row: LanguageRow) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({ ...row });
    setModalOpen(true);
  };

  const onPresetChange = (code: string) => {
    const p = presets.find((x) => x.code === code);
    if (p) {
      form.setFieldsValue({
        name: p.name,
        native_name: p.native_name,
        direction: p.direction,
      });
    }
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        const { code: _ignored, ...body } = values;
        updateLang(
          { resource: RESOURCE, id: editing.code, values: body },
          {
            onSuccess: () => {
              messageApi.success(`Language [${editing.code}] updated`);
              setModalOpen(false);
              reload();
            },
            onError: (e: any) => messageApi.error(e?.message || 'Update failed'),
          }
        );
      } else {
        createLang(
          { resource: RESOURCE, values },
          {
            onSuccess: (res: any) => {
              messageApi.success(res?.message || `Language [${values.code}] added`);
              runCustom(
                { url: `${RESOURCE}/${values.code}/sync`, method: 'post', values: {} },
                {
                  onSuccess: (syncRes: any) => {
                    const n = syncRes?.data?.imported ?? syncRes?.imported;
                    if (typeof n === 'number') {
                      messageApi.info(`Imported ${n} translation lines (missing strings fall back to English)`);
                    }
                  },
                }
              );
              setModalOpen(false);
              reload();
            },
            onError: (e: any) => messageApi.error(e?.message || 'Save failed'),
          }
        );
      }
    } catch {
      // validation failed — form shows errors
    }
  };

  const toggleActive = (row: LanguageRow, active: boolean) => {
    updateLang(
      { resource: RESOURCE, id: row.code, values: { is_active: active } },
      {
        onSuccess: () => {
          messageApi.success(`Language [${row.code}] ${active ? 'activated' : 'deactivated'}`);
          reload();
        },
        onError: (e: any) => messageApi.error(e?.message || 'Update failed'),
      }
    );
  };

  const setDefault = (row: LanguageRow) => {
    runCustom(
      { url: `${RESOURCE}/${row.code}/default`, method: 'post', values: {} },
      {
        onSuccess: (res: any) => {
          messageApi.success(res?.message || `Default set to [${row.code}]`);
          reload();
        },
        onError: (e: any) => messageApi.error(e?.message || 'Update failed'),
      }
    );
  };

  const syncNow = (row: LanguageRow) => {
    runCustom(
      { url: `${RESOURCE}/${row.code}/sync`, method: 'post', values: {} },
      {
        onSuccess: (res: any) => {
          const n = res?.data?.imported ?? res?.imported ?? 0;
          messageApi.success(`Synced ${n} lines for [${row.code}]`);
        },
        onError: (e: any) => messageApi.error(e?.message || 'Sync failed'),
      }
    );
  };

  const remove = (row: LanguageRow) => {
    deleteLang(
      { resource: RESOURCE, id: row.code },
      {
        onSuccess: (res: any) => {
          messageApi.success(res?.message || `Language [${row.code}] deleted`);
          reload();
        },
        onError: (e: any) => messageApi.error(e?.message || e?.response?.message || 'Delete failed'),
      }
    );
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (_: any, row: LanguageRow) => (
        <span className="inline-flex items-center gap-2">
          {flag(row.code)}
          <b>{row.code}</b>
          {row.is_default && <Tag color="gold">default</Tag>}
        </span>
      ),
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Native', dataIndex: 'native_name', key: 'native_name' },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (v: boolean, row: LanguageRow) => (
        <CanAccess resource="languages" action="edit" fallback={<Tag color={v ? 'green' : 'default'}>{v ? 'yes' : 'no'}</Tag>}>
          <Switch checked={v} onChange={(checked) => toggleActive(row, checked)} />
        </CanAccess>
      ),
    },
    { title: 'Order', dataIndex: 'sort_order', key: 'sort_order' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, row: LanguageRow) => (
        <span className="inline-flex gap-1">
          <CanAccess resource="languages" action="edit">
            <Button size="small" onClick={() => openEdit(row)}>Edit</Button>
          </CanAccess>
          <CanAccess resource="languages" action="edit">
            <Button size="small" onClick={() => syncNow(row)}>Sync</Button>
          </CanAccess>
          {!row.is_default && (
            <CanAccess resource="languages" action="edit">
              <Popconfirm title={`Set [${row.code}] as default?`} onConfirm={() => setDefault(row)}>
                <Button size="small">Default</Button>
              </Popconfirm>
            </CanAccess>
          )}
          {!row.is_default && (
            <CanAccess resource="languages" action="delete">
              <Popconfirm title={`Delete [${row.code}]?`} onConfirm={() => remove(row)}>
                <Button size="small" danger>Delete</Button>
              </Popconfirm>
            </CanAccess>
          )}
        </span>
      ),
    },
  ];

  return (
    <CanAccess resource="languages" action="list" fallback={<Unauthorized />}>
      {messageHolder}
      <Header
        title="Languages"
        content={
          <CanAccess resource="languages" action="create">
            <Button type="primary" icon={<TranslationOutlined />} onClick={openAdd}>
              Add language
            </Button>
          </CanAccess>
        }
      />
      <Table
        {...tableProps}
        rowKey="code"
        columns={columns as any}
        pagination={false}
      />
      <Modal
        style={{
          top: 9
        }}
        title={editing ? `Edit language [${editing.code}]` : 'Add language'}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        destroyOnHidden 
      >
        <Form form={form} layout="vertical" preserve={false}>
          {!editing && (
            <Form.Item
              label="Language"
              name="code"
              rules={[{ required: true, message: 'Pick a language' }]}
            >
              <Select
                showSearch={{ optionFilterProp: 'label' }}
                placeholder="Select language to add"
                options={presets.map((p) => ({
                  value: p.code,
                  label: `${p.native_name} (${p.name}) — ${p.code}`,
                  disabled: p.added,
                }))}
                onChange={onPresetChange}
              />
            </Form.Item>
          )}
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Malay" />
          </Form.Item>
          <Form.Item label="Native name" name="native_name">
            <Input placeholder="e.g. Bahasa Melayu" />
          </Form.Item>
          <Form.Item label="Direction" name="direction" initialValue="ltr">
            <Select
              options={[
                { value: 'ltr', label: 'LTR — left to right' },
                { value: 'rtl', label: 'RTL — right to left' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Sort order" name="sort_order">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </CanAccess>
  );
}
