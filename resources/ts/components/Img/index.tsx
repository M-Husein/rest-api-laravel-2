import { useState, useEffect, type ImgHTMLAttributes } from 'react'; // forwardRef, 

// Extend standard img attributes to include our custom fallback prop
interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

// Omit 'alt' from native attributes so we can redefine it as REQUIRED
// interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> {
//   fallback?: string;
//   alt: string;
// }

// Option default fallback
// "data:image/svg+xml,%3Csvg style='font-size:1.125rem;text-anchor:middle' height='100%25' preserveAspectRatio='xMidYMid slice' width='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23868e96'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' fill='%23dee2e6' dy='.3em'%3E200x200%3C/text%3E%3C/svg%3E"

/**
 * React 19
 */
export const Img = ({ 
  src, 
  // alt = "", 
  fallback, 
  onError, 
  ...etc 
}: ImgProps) => {
  "use memo";
  const [hasError, setHasError] = useState(false);

  // If the primary src prop changes, reset the error state to try loading the new image
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const handleError = (evt: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Only attempt to use fallback if it was actually provided, 
    // Prevent infinite loops if the fallback image also fails
    if (fallback && !hasError) {
      setHasError(true);
    }

    // If the parent component provided its own onError handler, call it
    onError?.(evt);
  };

  return (
    <img
      loading="lazy"
      decoding="async"
      alt=""

      {...etc} // Override props above

      src={hasError && fallback ? fallback : src}
      onError={handleError}
    />
  );
};

/**
 * It's good practice to set a display name when using forwardRef
 * so the component shows up properly in React DevTools
 */
// Img.displayName = 'Img';

/**
 * With loading state
 */
/*
const Img2 = forwardRef<HTMLImageElement, ImgProps>(
  ({ src, fallback, className, onError, onLoad, ...etc }, ref) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset states if the primary src prop changes
    useEffect(() => {
      setHasError(false);
      setIsLoading(true);
    }, [src]);

    const handleLoad = (evt: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoading(false); // Image finished loading, remove loading class
      
      // Call the parent's onLoad if it was provided
      onLoad?.(evt);
    };

    const handleError = (evt: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoading(false); // If it fails, it's no longer loading

      // Only attempt to use fallback if it was actually provided
      if (!hasError && fallback) {
        setHasError(true);
      }

      // Call the parent's onError if it was provided
      onError?.(evt);
    };

    // Combine any user-provided className with "loading" if isLoading is true
    // filter(Boolean) removes empty strings so we don't get extra spaces
    const computedClassName = [className, isLoading ? 'loading' : '']
      .filter(Boolean)
      .join(' ');

    return (
      <img
        loading="lazy"
        decoding="async"

        {...etc} // Override props above
        
        ref={ref}
        src={hasError && fallback ? fallback : src}
        className={computedClassName || undefined}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }
);
*/
