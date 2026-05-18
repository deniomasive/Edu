export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClass} border-4 border-primary/20 border-t-primary rounded-full animate-spin`} />
    </div>
  );
}
