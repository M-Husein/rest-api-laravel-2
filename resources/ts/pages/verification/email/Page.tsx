import { useEffect } from "react";
import { useDocumentTitle } from "@/utils/hooks/useDocumentTitle";
import { useParsed, useNotification } from "@refinedev/core"; // useCreate, HttpError, useOne
import { useNavigate } from "react-router";
// import { Card, Button } from 'antd';

const title = "Verification"; // Email Verification

export default function Page(){
  useDocumentTitle(title + " • " + APP.name);

  const { params: { status } } = useParsed<any>();
  // const { mutate, isPending } = useCreate();
  const navigate = useNavigate();
  const { open: openNotif } = useNotification();

  useEffect(() => {
    if(status){
      openNotif?.({
        type: status || "success",
        message: "✔️",
        description: "Verified"
      });

      navigate('/login', { replace: true });
    }
  }, [status]);

  return null;

  // if(status){
  //   return null;
  // }

  // return (
  //   <div className="grid place-content-center min-h-screen">
  //     <Card 
  //       title={title}
  //       className="shadow"
  //     >
  //       <h1 className="text-lg">
  //         Didn't receive the verification email?
  //       </h1>

  //       <Button
  //         type="primary"
  //         loading={isPending}
  //         onClick={() => {
  //           mutate({
  //             resource: "verification/spa",
  //             values: {},
  //           }, {
  //             onSuccess: () => {
  //               replace(import.meta.env.VITE_LOGIN_PATH)
  //             }
  //           })
  //         }}
  //       >
  //         Resending a link
  //       </Button>
  //     </Card>
  //   </div>
  // );
}
