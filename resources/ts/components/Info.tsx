// import { InfoCircleOutlined } from '@ant-design/icons';

export const Info = ({
  As = "div",
  prefixClass = "flex flex-col items-center",
  className,
  icon,
  children,
  ...etc
}: any) => {
  return (
    <As 
      {...etc}
      className={`${prefixClass || ""} ${className || ""}`}
    >
      {/* {icon || <InfoCircleOutlined style={{ fontSize: 65, color: '#ff7a00' }} />} */}
      {icon || <b style={{ fontSize: 65 }}>⚠️</b>}

      {children}
    </As>
  );
}

