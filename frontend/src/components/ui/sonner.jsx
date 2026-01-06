import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#1a1f29] group-[.toaster]:text-slate-100 group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl",
          description: "group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-[#ff8a3d] group-[.toast]:text-black group-[.toast]:font-bold group-[.toast]:hover:bg-[#ff8a3d]/90",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-slate-300 group-[.toast]:hover:bg-white/20",
          error: "group-[.toaster]:text-red-400",
          success: "group-[.toaster]:text-green-400",
          warning: "group-[.toaster]:text-yellow-400",
          info: "group-[.toaster]:text-blue-400",
        },
      }}
      {...props} />
  );
}

export { Toaster }
