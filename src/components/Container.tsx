import { cn } from "@/lib/utils";

const Container: React.FC<React.ComponentProps<"div">> = ({ children, className, ...props }) => {
  return (
    <div {...props} className={cn("max-w-5xl mx-auto px-5", className)}>
      {children}
    </div>
  );
};

export default Container;
