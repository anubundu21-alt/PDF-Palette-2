import { cn } from "@/lib/utils";

/** Site logo. The dark variant has a light "PDF" wordmark so it reads on dark backgrounds. */
const Logo = ({ className }: { className?: string }) => (
  <>
    <img src="/logo.png" alt="PDFRobin" width={489} height={160} className={cn("h-12 w-auto dark:hidden", className)} />
    <img src="/logo-dark.png" alt="PDFRobin" width={489} height={160} className={cn("hidden h-12 w-auto dark:block", className)} />
  </>
);

export default Logo;
