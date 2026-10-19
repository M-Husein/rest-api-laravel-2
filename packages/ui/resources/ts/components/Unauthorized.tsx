import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router";
import { Button } from 'antd';
import { Info } from '@/components/Info';

interface UnauthorizedProps {
  code?: number | string,
  desc?: React.ReactNode,
  style?: React.CSSProperties,
}

export const Unauthorized = ({
  code = 403,
  desc,
  style,
}: UnauthorizedProps) => {
  const translate = useTranslate();
  const navigate = useNavigate();

  return (
    <Info
      className="justify-center" // min-h-screen
      style={{ minHeight: 'calc(100vh - 128px)', ...style }}
    >
      {code && <h1 className="text-xxl font-bold my-2">{code}</h1>}
      <p className="text-base">{desc ?? translate('error.403')}</p>

      {!['/', '/app'].includes(window.location.pathname) && (
        <Button 
          type="primary"
          onClick={() => navigate("/")}
        >
          {translate("backHome")}
        </Button>
      )}
    </Info>
  );
}

