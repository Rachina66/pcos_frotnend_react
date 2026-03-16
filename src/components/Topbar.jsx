import useAuthStore from "../stores/authStore";

export default function Topbar({ title }) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-16 bg-white border-b border-pink-100 px-6 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          <p className="text-xs text-pink-400">{user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center">
          <span className="text-pink-700 font-semibold text-sm">
            {user?.name?.charAt(0)}
          </span>
        </div>
      </div>
    </header>
  );
}
