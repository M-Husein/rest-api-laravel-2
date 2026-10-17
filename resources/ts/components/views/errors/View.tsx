// import { useEffect } from "react"; // , useState
import { useTranslate } from "@refinedev/core"; // useResource
// import { RefineErrorPageProps } from "@refinedev/ui-types";
// import { Button, Result } from "antd";
import { Link } from "react-router"; // useNavigate

interface ViewProps {
  code?: number | string, 
  desc?: React.ReactNode,
}

export const View = ({
  code = 404, 
  desc, 
}: ViewProps) => {
  const translate = useTranslate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark_bg-gray-900">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h1 className="m-0 text-4xl leading-normal font-bold dark_text-gray-300 tracking-wider">
          {code}
        </h1>

        <p className="mb-4 text-lg dark_text-gray-300 tracking-wider">
          {desc ?? translate('error.' + code)}
        </p>

        <Link
          to="/"
          className="font-semibold"
          style={{ 
            textDecoration: 'underline',
            textUnderlineOffset: 7 
          }}
        >
          {translate('backHome')}
        </Link>
      </div>
    </div>
  );
}

// const [errorMessage, setErrorMessage] = useState<string>();
// const navigate = useNavigate();
// const { resource, action } = useResource();

// useEffect(() => {
//   if (resource) {
//     if (action) {
//       setErrorMessage(
//         translate(
//           "pages.error.info",
//           {
//             action: action,
//             resource: resource?.name,
//           },
//           `You may have forgotten to add the "${action}" component to "${resource?.name}" resource.`,
//         ),
//       );
//     }
//   }
// }, [resource, action]);

// useEffect(() => {
//   // document.getElementById('loaderApp')?.classList.add('hidden');
//   toggleLoaderApp();
// }, []);

// return (
//   <Result
//     status="404"
//     title="404"
//     extra={
//       <div>
//         <p>Sorry, the page you visited does not exist.</p>

//         <Button
//           type="primary"
//           onClick={() => navigate("/")}
//         >
//           Back to Home
//         </Button>
//       </div>
//     }
//   />
// );
