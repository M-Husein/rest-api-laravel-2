import { Table as AntTable } from 'antd';

/**
 * @props pagination Object
 * @props ...etc antd Table props
 * @returns antd Table component
 * 
 * @DOCS : https://ant.design/components/table
 */
export const Table = ({
  pagination,
  ...etc
}: any) => (
  <AntTable
    size="small"
    rowKey="id"

    {...etc}
    
    // pagination={fixPagination()}
    pagination={
      pagination ? {
        showSizeChanger: true,
        showTotal: (total: any, [range1, range2]: any) => `${range1}-${range2} of ${total} items`,
        ...pagination,
        placement: pagination.position || pagination.placement,
        // Temporary to prevent console in browser
        position: void 0,
        // position: ["bottomCenter"], // default = bottomRight
      }
      : 
      false
    }
  />
);
