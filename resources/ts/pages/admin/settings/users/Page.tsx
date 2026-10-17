import { useState } from 'react';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { TableColumnsType } from 'antd';
import { Button, Modal } from 'antd';
// import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetIdentity, useCan, useTranslate, useDelete, useDeleteMany } from "@refinedev/core";
import { useTable, getDefaultSortOrder } from "@/utils/core";
import { useSearchParams, Link } from "react-router";
import dayjs from 'dayjs';
import { ButtonReload } from '@/components/ButtonReload';
import { Table } from '@/components/table/Table';
import { Header } from '@/components/table/Header';
import { getColumnSearchProps, filterDate, sorting } from '@/components/table/utils'; // , getFilterByField
import { Unauthorized } from '@/components/Unauthorized';
import { isUserSystem } from '@/utils/user';

const Content = ({ title }: { title: string }) => {
  const { data: currentUser } = useGetIdentity<any>();
  const translate = useTranslate();
  const { mutate: mutateDelete, mutation: mutationDelete } = useDelete();
  const { mutate: mutateDeleteMany, mutation: mutationDeleteMany } = useDeleteMany();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const {
    tableProps,
    // currentPage,
    // pageSize,
    sorters,
    filters, // 👈 get current filters from URL
    tableQuery: {
      isLoading,
      isFetching, 
      isRefetching, 
      refetch 
    }, 
    // setCurrentPage,
  } = useTable({
    syncWithLocation: true,
    resource: "users",
    meta: { 
      q, 
      // 'name,email,username,phone'
      /** @OR */
      // ['name', 'email', 'username', 'phone']
      // ,phone,pending_email,hasPassword
      select: 'name,email,username,created_at,email_verified_at'
    },
  });

  // console.log({ tableProps });
  
  const loadingProcess = mutationDelete.isPending || mutationDeleteMany.isPending;

  const confirmModal = (title: any, content: any, callback: (fn: any) => void): void => {
    const modalConfirm = modalApi.confirm({
      keyboard: false,
      centered: true,
      title,
      content,
      cancelButtonProps: { disabled: false },
      onOk(){
        const updateConfirm = (disabled: boolean) => {
          modalConfirm.update({
            cancelButtonProps: { disabled }
          })
        }

        updateConfirm(true);

        return callback(updateConfirm);
      },
    });
  }

  const clickDelete = (item: any) => {
    confirmModal(
      translate("confirms.delete"),
      item.name,
      (updateConfirm) => new Promise((resolve, reject) => {
        mutateDelete({
          resource: "users",
          id: item.id,
        }, {
          onError: (err) => {
            updateConfirm(false)
            reject(err)
          },
          onSuccess: (res: any) => {
            refetch();
            resolve(res);
          },
        });
      })
    );
  }

  const onClickDeleteRows = () => {
    confirmModal(
      translate("confirms.delete"),
      selectedRowKeys.length + ' items',
      (updateConfirm) => new Promise((resolve, reject) => {
        mutateDeleteMany({
          ids: selectedRowKeys,
          resource: "users/delete",
        }, {
          onError: (err) => {
            updateConfirm(false)
            reject(err)
          },
          onSuccess: (res: any) => {
            setSelectedRowKeys([]);
            refetch();
            resolve(res);
          },
        });
      })
    );
  }

  const parseColumn = (
    title: string, 
    key: string, 
    width: number, 
    sort: number
  ) => ({
    title,
    key,
    dataIndex: key,
    width,
    sorter: { 
      compare: sorting(key),
      multiple: sort 
    },
    sortOrder: getDefaultSortOrder(key, sorters),
    ...(key.endsWith('_at') ? filterDate(key, filters) : getColumnSearchProps(key, filters)),
    // filteredValue: getFilterByField(filters, key),
  });

  const columns: TableColumnsType<any> = [
    {
      ...parseColumn('ID', 'id', 75, 1),
      render: (val: any) => <Link to={"/settings/users/" + val} inert={loadingProcess}>{val}</Link>,
    },
    {
      ...parseColumn('Name', 'name', 255, 2),
      render: (val: any, row: any) => <Link to={"/settings/users/" + row.id} inert={loadingProcess}>{val}</Link>,
    },
    parseColumn('Username', 'username', 135, 3),
    // {
    //   ...parseColumn('Email', 'email', 145, 4),
    //   render: (val: any) => val && <a href={"mailto:" + val}>{val}</a>
    // },
    // parseColumn('Phone', 'phone', 145, 5),
    {
      ...parseColumn('Pending Email', 'pending_email', 145, 6),
      render: (val: any) => val && <a href={"mailto:" + val}>{val}</a>
    },
    { 
      ...parseColumn('Created at', 'created_at', 145, 7),
      render: (val: any) => val && dayjs(val).format('DD MMM YYYY, HH:mm')
    },
    {
      ...parseColumn('Email verified at', 'email_verified_at', 165, 8),
      render: (val: any) => val && dayjs(val).format('DD MMM YYYY, HH:mm')
    },
    {  
      title: 'Has Password',
      dataIndex: 'hasPassword',
      key: 'hasPassword',
      width: 105,
      align: 'center',
      render: (val: any) => val ? "✔️" : ""
    },
    {
      title: '',
      dataIndex: 'x',
      key: 'x',
      // align: 'center',
      // fixed: 'right',
      width: 75,
      render: (_val: any, row: any) => {
        const isSystem = isUserSystem(row);
        return (
          <>
            <Button
              title="Edit"
              size="small"
              ghost
              type="primary"
              icon={<b>✏️</b>} // <EditOutlined />
              disabled={(isSystem && !isUserSystem(currentUser)) || loadingProcess}
              // onClick={() => toggleFormModal(row)}
            />
            {' '}
            {!isSystem && (
              <Button
                title="Delete"
                size="small"
                type="primary"
                ghost
                danger
                icon={<b>🗑️</b>} // <DeleteOutlined />
                disabled={loadingProcess} // isSystem || 
                // className={isSystem ? "invisible" : ""}
                onClick={() => clickDelete(row)}
              />
            )}
          </>
        );
      },
    },
  ];

  const renderTitle = () => (
    <Header
      title={title}
      content={
        <>
          {!!selectedRowKeys.length && (
            <Button
              danger
              type="primary"
              onClick={onClickDeleteRows}
            >
              {translate('buttons.deleteSelected')} ({selectedRowKeys.length})
            </Button>
          )}

          <ButtonReload
            disabled={loadingProcess}
            loading={!isLoading && isRefetching}
            onClick={() => refetch()}
          />
          
          <Button
            type="primary"
            // onClick={() => toggleFormModal({ name: '' })}
          >
            Create
          </Button>
        </>
      }
      defaultValue={q}
      onSearch={(val: any) => {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          const keyword = val.trim();
          if (keyword) {
            newParams.set("q", keyword);
          } else {
            newParams.delete("q");
          }

          newParams.set("currentPage", "1");

          return newParams;
        }, { replace: true });
      }}
    />
  );

  // console.log('tableProps:', tableProps);

  return (
    <>
      <Table
        {...tableProps}
        loading={tableProps.loading || isFetching}
        className="antTable max-md_antTable-xs"
        scroll={{ x: 'max-content' }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        title={renderTitle}
      />

      {modalContextHolder}
    </>
  );
}

export default function Page() {
  const TITLE_PAGE = "Users";
  
  useDocumentTitle(TITLE_PAGE);

  const { data: accessControl } = useCan({
    resource: "users",
    action: "list",
  });

  if(!accessControl){
    return null;
  }

  return accessControl.can ? <Content title={TITLE_PAGE} /> : <Unauthorized />;
}
