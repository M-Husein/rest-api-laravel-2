// import { Link } from "react-router"; // @/components/router
// import { theme } from "antd"; // Typography, Space

type TitleProps = {
  collapsed?: boolean,
  icon?: any,
  text?: any,
  [key: string]: unknown,
}

export const Title = ({
  collapsed,
  icon,
  text,
  ...etc
}: TitleProps) => {
  return (
    <a // Link
      // to="/" 
      {...etc}
      className="inline-flex txt-main"
      translate="no"
    >
      {icon}

      <b 
        className="ml-2 text-base"
        hidden={collapsed}
      >
        {text}
      </b>
    </a>
  );
};
