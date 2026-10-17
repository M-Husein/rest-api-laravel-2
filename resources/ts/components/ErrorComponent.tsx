// import { useEffect } from "react"; // , useState
import { useTranslate } from "@refinedev/core"; // useResource
// import { RefineErrorPageProps } from "@refinedev/ui-types";
// import { Button, Result } from "antd";
import { Link } from "react-router"; // useNavigate
// import { toggleLoaderApp } from '@/utils/dom';

/**
 * When the app is navigated to a non-existent route, refine shows a default error page.
 * A custom error component can be used for this error page.
 *
 * @see {@link https://refine.dev/docs/packages/documentation/routers/} for more details.
 */
export const ErrorComponent = () => { // : React.FC<RefineErrorPageProps>
  const translate = useTranslate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark_bg-gray-900">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h1 className="m-0 text-4xl leading-normal font-bold dark_text-gray-300 tracking-wider">
          404
        </h1>

        <p className="mb-4 text-lg dark_text-gray-300 tracking-wider">
          {translate('error.404')}
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
