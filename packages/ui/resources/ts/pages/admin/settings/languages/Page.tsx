import { useCallback, useEffect, useState } from "react";
import { Avatar, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Switch, Table, Tag, message } from "antd";
import { CanAccess } from "@refinedev/core";
import { TranslationOutlined } from '@ant-design/icons';
import { featureApi } from '@/core/feature';
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

const http = () => featureApi.getHttp();

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

export default function Page() {
  const [rows, setRows] = useState<LanguageRow[]>([]);
  const [presets, setPresets] = useState<PresetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LanguageRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, messageHolder] = message.useMessage();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [langs, opts]: any[] = await Promise.all([
        http().get('admin/languages'),
        http().get('admin/language-presets'),
      ]);
      setRows(langs?.data ?? []);
      setPresets(opts?.data ?? []);
    } catch {
      messageApi.error('Failed to load languages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

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
      setSaving(true);
      if (editing) {
        const { code, ...body } = values;
        await http().put(`admin/languages/${editing.code}`, { json: body });
        messageApi.success(`Language [${editing.code}] updated`);
      } else {
        const res: any = await http().post('admin/languages', { json: values });
        const sync: any = await http().post(`admin/languages/${values.code}/sync`, { json: {} });
        messageApi.success(res?.message || `Language [${values.code}] added`);
        if (typeof sync?.data?.imported === 'number') {
          messageApi.info(`Imported ${sync.data.imported} translation lines (missing strings fall back to English)`);
        }
      }
      setModalOpen(false);
      reload();
    } catch (e: any) {
      if (e?.response) {
        const body: any = await e.response.json().catch(() => null);
        messageApi.error(body?.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: LanguageRow, active: boolean) => {
    try {
      await http().put(`admin/languages/${row.code}`, { json: { is_active: active } });
      messageApi.success(`Language [${row.code}] ${active ? 'activated' : 'deactivated'}`);
      reload();
    } catch {
      messageApi.error('Update failed');
    }
  };

  const setDefault = async (row: LanguageRow) => {
    try {
      const res: any = await http().post(`admin/languages/${row.code}/default`, { json: {} });
      messageApi.success(res?.message || `Default set to [${row.code}]`);
      reload();
    } catch {
      messageApi.error('Update failed');
    }
  };

  const syncNow = async (row: LanguageRow) => {
    try {
      const res: any = await http().post(`admin/languages/${row.code}/sync`, { json: {} });
      messageApi.success(`Synced ${res?.data?.imported ?? 0} lines for [${row.code}]`);
    } catch {
      messageApi.error('Sync failed');
    }
  };

  const remove = async (row: LanguageRow) => {
    try {
      await http().delete(`admin/languages/${row.code}`);
      messageApi.success(`Language [${row.code}] deleted`);
      reload();
    } catch (e: any) {
      if (e?.response) {
        const body: any = await e.response.json().catch(() => null);
        messageApi.error(body?.message || 'Delete failed');
      }
    }
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
        rowKey="code"
        dataSource={rows}
        columns={columns as any}
        loading={loading}
        pagination={false}
      />
      <Modal
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

      {messageHolder}
    </CanAccess>
  );
}
