import { useRef } from 'react';
import { Input } from 'antd';

type IProps = {
  title?: any;
  content?: any;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  onSearch?: (val: string, e: any, info: any) => void;
  onChange?: (e: any) => void;
}

export const Header = ({
  title,
  content,
  placeholder = "Search",
  defaultValue,
  value,
  disabled,
  onSearch,
  onChange,
}: IProps) => {
  const searchInput = useRef<any>(null);

  const doSearch = (val: string, e: any, info: any) => {
    e.stopPropagation();
    if(e.type === "click" && e.target.tagName !== "INPUT"){
      setTimeout(() => {
        searchInput.current?.focus?.({ preventScroll: true });
      }, 1);
    }

    onSearch?.(val, e, info);
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-1">
      {title && <div className="text-lg mr-auto">{title}</div>}

      {content}

      {onSearch && (
        <Input.Search
          ref={searchInput}
          allowClear
          className="md_w-56"
          placeholder={placeholder}
          title={placeholder}
          defaultValue={defaultValue}
          value={value}
          disabled={disabled}
          onSearch={doSearch}
          onChange={onChange}
        />
      )}
    </div>
  );
}
