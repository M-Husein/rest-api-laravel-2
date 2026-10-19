# Img

```tsx
import { forwardRef, useEffect, useRef, useState } from 'react'; 
// import { cn } from 'q-js-utils/cn';

// type ImageEvent = React.SyntheticEvent<HTMLImageElement, Event>;

export type ImgProps = {
  // src?: string | any,
  // alt?: string,
  // draggable?: boolean,
  // className?: string,
  // onError?: (e: ImageEvent) => void,
  // onLoad?: (e: ImageEvent) => void,
} & React.ImgHTMLAttributes<HTMLImageElement>;

export const Img = forwardRef<HTMLImageElement, ImgProps>(
  (
    {
      // src,
      alt,
      // draggable = false,
      style,
      onError,
      onLoad,
      ...etc
    },
    ref
  ) => {
    const localRef = useRef<HTMLImageElement>(null);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);

    useEffect(() => {
      const node = localRef.current;
      if (!node || hasBeenVisible) return;

      const observer = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect(); // stop observing after first visibility
        }
      }, {
        rootMargin: '100px',
        threshold: 0.01,
      });

      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    // const Load = (e: ImageEvent) => {
    //   onLoad?.(e);
    // }

    // const Err = (e: ImageEvent) => {
    //   onError?.(e);
    // }

    return (
      <img
        loading="lazy"
        decoding="async"

        {...etc} // Override props above
        
        // ref={ref}
        ref={(node) => {
          localRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.RefObject<HTMLImageElement | null>).current = node;
        }}
        style={{
          ...style,
          contentVisibility: hasBeenVisible ? 'auto' : 'hidden'
        }}

        alt={alt || ""}
        // src={src}
        // className={
        //   cn(
        //     "ava",
        //     load && "ava-loader",
        //     errorClass,
        //     className
        //   )
        // }
        // onError={Err}
        // onLoad={Load}
      />
    );
  }
);
```
