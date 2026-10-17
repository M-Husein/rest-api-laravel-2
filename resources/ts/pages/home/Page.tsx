// import { useEffect } from "react";
import { useDocumentTitle } from "@/utils/hooks/useDocumentTitle";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
import { Card } from 'antd';

export default function Page(){
  useDocumentTitle(APP.name); // "Home • " + 

  return (
    <div className="py-4 px-2 max-w-screen-xl mx-auto">
      <Card 
        title="Home"
        className="shadow"
      >
        {/* {UNDEFINED} */}

        {/* <p className="text-lg">text-lg</p>
        <p className="text-xl">text-xl</p>
        <p className="text-4xl">text-2xl</p> */}
      </Card>
    </div>
  );
}
