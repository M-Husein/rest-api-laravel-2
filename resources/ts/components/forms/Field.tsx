import type { ControllerProps } from 'react-hook-form'; // , FieldError, FieldErrors
import { Controller, get } from 'react-hook-form';

type InputRenderFunction = (props: any) => React.ReactElement;

interface FieldProps extends Omit<ControllerProps, 'render'> {
  WrapAs?: React.ElementType,
  wrapProps?: any,
  id?: string,
  name: string,
  label?: React.ReactNode,
  error?: any, // FieldErrors<any>
  control: any,
  render: InputRenderFunction,
  end?: React.ReactNode,
  showError?: boolean,
  [key: string]: unknown;
}

/**
 * @param WrapAs    : React.ElementType
 * @param wrapProps : Element props
 * @param id        : string
 * @param name      : string
 * @param label     : string | valid jsx/html in <label />
 * @param error     : errors or error data
 * @param render    : (props) => ReactElement
 * @param etc       : Other props for <Controller />
 */
export const Field = ({
  WrapAs = "div",
  wrapProps,
  id, 
  name,
  label,
  error,
  end,
  showError = true,
  // 'aria-describedby': ariaDescribeBy, 
  render,
  ...etc
}: FieldProps) => {
  const myId = id || name;
  const errorAriaDescribeBy = myId + "_err";
  
  // RHF's get helper safely parses dot-notation paths like "posts.0.title"
  const fixError = get(error, name);
  // const fixError = error?.[name]; //  || error
  // const fixError = error?.[name] as FieldError | undefined;

  // console.log({ fixError, error });

  return (
    <WrapAs
      {...wrapProps}
    >
      {label && <label htmlFor={myId} className="mb-1">{label}</label>}

      <Controller
        {...etc}
        name={name}
        render={
          (props) => render({ 
            ...props, 
            field: { 
              ...props.field, 
              id: myId, 
              'aria-describedby': errorAriaDescribeBy, // + (ariaDescribeBy ? " " + ariaDescribeBy : "")
              status: fixError ? "error": void 0, 
            } 
          })
        }
      />

      {showError && fixError && (
        <div 
          role="alert"
          id={errorAriaDescribeBy}
          className="mt-1 text-xs text-red-600"
        >
          {fixError.message}
        </div>
      )}

      {end}
    </WrapAs>
  );
}
