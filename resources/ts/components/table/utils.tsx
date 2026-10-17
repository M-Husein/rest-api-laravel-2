import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnType } from 'antd'; // , TableColumnsType
import { Input, Button, DatePicker, InputNumber } from 'antd'; // , Space, 
// import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import type { OpUnitType } from 'dayjs';
// import { isNumber } from 'q-js-utils/isNumber';
import { getGranularity } from '@/utils/date';
import { triggerFocusEnter } from '@/utils/dom';

export type RefineSorter = {
  field: string;
  order: 'asc' | 'desc';
}

export const getFilterByField = (filters: any, field: string) => {
  return filters?.find((item: any) => item.field === field)?.value || null;
}

export const sorting = (key: string) => (a: any, b: any) => {
  const valA = a[key] ?? '';
  const valB = b[key] ?? '';
  // Check if values are numbers
  if(typeof valA === 'number' && typeof valB === 'number'){
    return valA - valB;
  }
  // Fallback to string comparison for names/emails
  return Object.is(valA, valB) ? 0 : ('' + valA).localeCompare('' + valB);
};

// sorter: (a: any, b: any) => {
//   let valA = a[key] ?? '';
//   let valB = b[key] ?? '';
//   if (typeof valA === 'number' && typeof valB === 'number') {
//     return valA - valB;
//   }
//   return ('' + valA).localeCompare('' + valB);
// },

type DataIndex = string; //  | number

export const getColumnSearchProps = (dataIndex: DataIndex, filters?: any): TableColumnType<any> => {
  // Plain ref object (not useRef): this is a regular helper, not a hook/component,
  // so hooks are not allowed here. Identity per call is fine because all closures
  // below are created in the same call and share this object.
  const searchInput: { current: InputRef | null } = { current: null };

  return {
    // filteredValue: getFilterByField(filters, 'soal_type_name') || null,
    filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters, close }) => {
      // console.log('selectedKeys:', selectedKeys);
      const changeInput = (e: any) => {
        const val = e.target.value;
        setSelectedKeys(val ? [val] : []);
      }

      const doSearch = (val: string, e: any, { source }: any) => {
        e.stopPropagation();
        if(e.type === "click" && e.target.tagName !== "INPUT"){
          setTimeout(() => {
            searchInput.current?.focus?.({ preventScroll: true });
          }, 1);
        }

        if(source === 'clear' && clearFilters){
          clearFilters()
        }

        confirm({ closeDropdown: !!val?.length });
      }

      return (
        <div 
          className="p-2 border rounded-lg flex"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Input.Search
            ref={searchInput}
            allowClear
            // size="small"
            placeholder="Search"
            value={selectedKeys[0]}
            onChange={changeInput}
            // onPressEnter={() => confirm()} // handleSearch(selectedKeys as string[], confirm, dataIndex)
            onSearch={doSearch} // () => confirm()
          />
          <Button
            title="Close"
            className="ml-1"
            icon={<CloseOutlined />}
            onClick={() => close()}
          />
        </div>
      )
    },
    filterIcon: () => ( // filtered: boolean
      // style={filtered ? { color: '#1677ff', background: '#bae0ff' } : {}}
      <SearchOutlined title="Filter" />
    ),
    onFilter: (value, record) => {
      return record[dataIndex] ? 
        (record[dataIndex] ?? '')
          // .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase())
        :
        false
    },
    filteredValue: getFilterByField(filters, dataIndex),
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) setTimeout(() => searchInput.current?.select(), 9);
      }
    }
  }
}

// selectedKeys, setSelectedKeys, confirm, clearFilters
export const filterNumber = (dataIndex: DataIndex, props?: any): TableColumnType<any> => {
  const fixId = dataIndex + Date.now();
  return {
    filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, close }) => { // , visible
      const changeInput = (val: any) => {
        setSelectedKeys(val ? [val] : []);
        confirm();
      }
      return (
        <div 
          className="p-2 border rounded-lg flex"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <InputNumber
            {...props}
            id={fixId}
            className="w-full"
            stringMode
            value={selectedKeys?.[0]}
            onChange={changeInput}
          />
          <Button
            title="Close"
            className="ml-1"
            icon={<CloseOutlined />}
            onClick={() => close()}
          />
        </div>
      )
    },
    onFilter: (value: any, record) => {
      return value && +value === record[dataIndex]
    },
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) setTimeout(() => triggerFocusEnter("#" + fixId), 9);
      }
    }
  }
}

/**
 * 
 * @param dataIndex string - Column / field name
 * @param etc? Object - DatePicker props, onFilter(value, record, dataIndex) (to customize filter function)
 * @returns 
 */
export const filterDate = (dataIndex: DataIndex, etc: any = {}): TableColumnType<any> => {
  const fixId = dataIndex + Date.now();
  
  // Destructure custom onFilter separately if you want to allow overrides
  const { onFilter: customOnFilter, ...inputProps } = etc;

  // // ✅ Compute granularity ONCE, outside the hot path
  // const formatString = inputProps.format?.format || inputProps.format || '';
  // const granularity = getGranularity(formatString);

  // ✅ Compute it once, lazily (cached in a closure)
  let cachedGranularity: OpUnitType | null = null;
  const getGranularityCached = (format: string) => {
    if (cachedGranularity === null) {
      cachedGranularity = getGranularity(format);
    }
    return cachedGranularity;
  };

  return {
    filterDropdown: ({ selectedKeys, setSelectedKeys, confirm }) => {
      const changeInput = (date: dayjs.Dayjs | null) => {
        setSelectedKeys(date ? [date.toISOString()] : []);
        confirm();
      };

      const value = selectedKeys?.[0] ? dayjs(selectedKeys[0] as string) : null;

      return (
        <DatePicker
          {...inputProps}
          id={fixId}
          value={value}
          onChange={changeInput}
        />
      );
    },
    onFilter: (value: any, record: any) => {
      // 1. Allow custom override if provided
      if (customOnFilter && typeof customOnFilter === 'function') {
        return customOnFilter(value, record);
      }

      // 2. No value → no filter applied
      if (!value) return true;

      // 3. Parse dates
      const selectedDate = dayjs(value);
      if (!selectedDate.isValid()) return false;

      const recordDate = dayjs(record[dataIndex]);
      if (!recordDate.isValid()) return false;

      // ✅ Only computes on the first row of the first filter application
      const granularity = getGranularityCached(inputProps.format?.format || inputProps.format || '');

      // 4. Compare using the pre-computed granularity
      return recordDate.isSame(selectedDate, granularity);
    },
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) setTimeout(() => triggerFocusEnter("#" + fixId), 9);
      },
    },
  };
};

// export const filterYear = (dataIndex: DataIndex): TableColumnType<any> => {
//   let fixId = dataIndex + Date.now(); // "picker" + dataIndex
//   return {
//     filterDropdown: ({ selectedKeys, setSelectedKeys, confirm }) => { // , visible
//       const changeInput = (_date: any, dateStr: any) => {
//         setSelectedKeys(dateStr ? [dateStr] : []);
//         // Close Picker
//         confirm(); // { closeDropdown: !!dateStr }
//       }
//       return (
//         <DatePicker
//           // open={visible}
//           id={fixId}
//           picker="year"
//           // placement="bottomLeft"
//           // inputReadOnly
//           // className="border-orange-300"
//           value={selectedKeys?.[0] ? dayjs(selectedKeys[0] as any) : null}
//           onChange={changeInput}
//         />
//       )
//     },
//     onFilter: (value: any, record) => {
//       return value && +value === record[dataIndex]
//     },
//     filterDropdownProps: {
//       onOpenChange: (visible) => {
//         if (visible) setTimeout(() => triggerFocusEnter("#" + fixId), 9);
//       }
//     }
//   }
// }
