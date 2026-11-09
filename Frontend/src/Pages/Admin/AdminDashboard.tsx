import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  UserRound,
  UserPlus,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  LogOut,
  Activity,
  ShieldCheck,
  Mail,
  ChevronDown,
  HeartPulse,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

type Role = "Patient" | "Doctor" | "Receptionist";
type Tab = "Overview" | "All Users" | "Doctors" | "Receptionists";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialty?: string;
}

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "Doctor" as Role,
  specialty: "",
};

function parseUsers(data: unknown): User[] {
  if (
    !data ||
    typeof data !== "object" ||
    !("users" in data) ||
    !Array.isArray(data.users)
  ) {
    throw new Error("The server returned an invalid user list.");
  }

  const roles: Record<string, Role> = {
    patient: "Patient",
    doctor: "Doctor",
    receptionist: "Receptionist",
  };

  return data.users.map((item: unknown) => {
    if (!item || typeof item !== "object") {
      throw new Error("The server returned an invalid user.");
    }

    const account = item as Record<string, unknown>;
    const role =
      typeof account.role === "string" ? roles[account.role] : undefined;

    if (
      typeof account.id !== "string" ||
      typeof account.name !== "string" ||
      typeof account.email !== "string" ||
      !role
    ) {
      throw new Error("The server returned an invalid user.");
    }

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role,
      specialty:
        typeof account.specialty === "string" ? account.specialty : undefined,
    };
  });
}

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchUsers = useCallback(async (): Promise<User[]> => {
    if (!token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const response = await fetch(`${API_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: unknown = await response.json();

    if (!response.ok) {
      const message =
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Unable to load accounts.";
      throw new Error(message);
    }

    return parseUsers(data);
  }, [token]);

  useEffect(() => {
    let active = true;

    fetchUsers()
      .then((loadedUsers) => {
        if (active) {
          setUsers(loadedUsers);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load accounts.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingUsers(false);
      });

    return () => {
      active = false;
    };
  }, [fetchUsers]);

  const patients = users.filter((u) => u.role === "Patient").length;
  const doctors = users.filter((u) => u.role === "Doctor").length;
  const receptionists = users.filter((u) => u.role === "Receptionist").length;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All Users" ||
        (activeTab === "Doctors" && user.role === "Doctor") ||
        (activeTab === "Receptionists" && user.role === "Receptionist") ||
        (activeTab === "Overview" && true);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesTab && matchesRole;
    });
  }, [users, search, activeTab, roleFilter]);

  const openAddModal = (role: Role = "Doctor") => {
    setEditingUser(null);
    setForm({ ...emptyForm, role });
    setShowPassword(false);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (account: User) => {
    setEditingUser(account);
    setForm({
      ...emptyForm,
      name: account.name,
      email: account.email,
      role: account.role,
      specialty: account.specialty ?? "",
    });
    setShowPassword(false);
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const response = await fetch(
        editingUser
          ? `${API_URL}/api/auth/staff/${editingUser.id}`
          : `${API_URL}/api/auth/staff`,
        {
          method: editingUser ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            ...(form.password ? { password: form.password } : {}),
            ...(!editingUser
              ? { role: form.role === "Doctor" ? "doctor" : "receptionist" }
              : {}),
            ...(form.role === "Doctor" ? { specialty: form.specialty } : {}),
          }),
        },
      );
      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Unable to create the account.";
        throw new Error(message);
      }

      setUsers(await fetchUsers());
      setModalOpen(false);
      setEditingUser(null);
      setForm(emptyForm);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create the account.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account: User) => {
    if (account.role === "Patient") return;
    if (!window.confirm(`Delete ${account.name}'s account?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/staff/${account.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Unable to delete the account.";
        throw new Error(message);
      }

      setUsers(await fetchUsers());
      setLoadError("");
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to delete the account.",
      );
    }
  };

  const handleLogout = () => {
    void logout()
      .catch((error: unknown) => {
        console.error("Unable to notify the server about logout:", error);
      })
      .finally(() => navigate("/login", { replace: true }));
  };

  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "All Users", icon: Users },
    { name: "Doctors", icon: Stethoscope },
    { name: "Receptionists", icon: UserRound },
  ] as const;

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearch("");
    setRoleFilter("All");
    setMobileOpen(false);
  };

  const pageTitle = activeTab === "Overview" ? "Dashboard Overview" : activeTab;

  return (
    <div className="min-h-screen bg-[#F1F8FD] text-slate-700">
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-blue-100 bg-white transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-blue-50 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3FC]">
              <HeartPulse size={27} className="text-[#299BCF]" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-[#E51E2A]">Fam</span>
              <span className="text-[#299BCF]">Care</span>
            </span>
          </div>

          <button className="lg:hidden" onClick={() => setMobileOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Administration
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => changeTab(item.name)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-[#EAF3FC] text-[#299BCF]"
                      : "text-slate-500 hover:bg-[#F1F8FD] hover:text-[#299BCF]"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-blue-50 p-5">
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#F1F8FD] p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#299BCF] text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {user?.name ?? "Administrator"}
              </p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-64">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-blue-100 bg-white/95 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-blue-50 lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
                {pageTitle}
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your FamCare healthcare platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-xl bg-[#EAF3FC] p-2.5 text-[#299BCF]">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E51E2A]" />
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#299BCF] font-bold text-white">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {user?.name ?? "Admin"}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        <div className="space-y-7 p-4 sm:p-8">
          {loadError && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
            >
              {loadError}
              <button
                onClick={() => {
                  setLoadingUsers(true);
                  setLoadError("");
                  fetchUsers()
                    .then(setUsers)
                    .catch((error: unknown) =>
                      setLoadError(
                        error instanceof Error
                          ? error.message
                          : "Unable to load accounts.",
                      ),
                    )
                    .finally(() => setLoadingUsers(false));
                }}
                className="ml-3 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* OVERVIEW */}
          {activeTab === "Overview" && (
            <>
              <div className="rounded-2xl bg-gradient-to-r from-[#299BCF] to-[#55B9E8] p-6 text-white shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="mb-2 text-sm text-blue-50">
                      Welcome back, Administrator!
                    </p>
                    <h2 className="text-2xl font-bold sm:text-3xl">
                      Manage FamCare with ease
                    </h2>
                    <p className="mt-2 max-w-lg text-sm text-blue-50">
                      Monitor registered users and manage your doctors and
                      receptionists from one place.
                    </p>
                  </div>

                  <button
                    onClick={() => openAddModal("Doctor")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#299BCF] transition hover:bg-blue-50"
                  >
                    <UserPlus size={19} />
                    Add New Staff
                  </button>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: "Total Users",
                    value: users.length,
                    icon: Users,
                    color: "bg-blue-100 text-[#299BCF]",
                  },
                  {
                    title: "Registered Patients",
                    value: patients,
                    icon: UserRound,
                    color: "bg-green-100 text-green-600",
                  },
                  {
                    title: "Total Doctors",
                    value: doctors,
                    icon: Stethoscope,
                    color: "bg-red-100 text-[#E51E2A]",
                  },
                  {
                    title: "Receptionists",
                    value: receptionists,
                    icon: ShieldCheck,
                    color: "bg-purple-100 text-purple-600",
                  },
                ].map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.title}
                      className="rounded-2xl border border-blue-50 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">{stat.title}</p>
                          <h3 className="mt-2 text-3xl font-bold text-slate-800">
                            {stat.value}
                          </h3>
                        </div>

                        <div className={`rounded-xl p-3 ${stat.color}`}>
                          <Icon size={24} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* QUICK ACTIONS */}
              <div>
                <h2 className="mb-4 text-lg font-bold text-slate-800">
                  Quick Actions
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => openAddModal("Doctor")}
                    className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-sm transition hover:border-[#55B9E8] hover:shadow-md"
                  >
                    <div className="rounded-xl bg-blue-100 p-3 text-[#299BCF]">
                      <Stethoscope size={25} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        Register New Doctor
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Create a doctor account
                      </p>
                    </div>
                    <Plus className="ml-auto text-[#299BCF]" />
                  </button>

                  <button
                    onClick={() => openAddModal("Receptionist")}
                    className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-sm transition hover:border-[#55B9E8] hover:shadow-md"
                  >
                    <div className="rounded-xl bg-red-50 p-3 text-[#E51E2A]">
                      <UserPlus size={25} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        Register Receptionist
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Create a receptionist account
                      </p>
                    </div>
                    <Plus className="ml-auto text-[#299BCF]" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* USER MANAGEMENT */}
          {activeTab !== "Overview" && (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {activeTab}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    View and manage registered FamCare accounts.
                  </p>
                </div>

                {(activeTab === "Doctors" || activeTab === "Receptionists") && (
                  <button
                    onClick={() =>
                      openAddModal(
                        activeTab === "Doctors" ? "Doctor" : "Receptionist",
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#55B9E8]"
                  >
                    <Plus size={19} />
                    Add {activeTab === "Doctors" ? "Doctor" : "Receptionist"}
                  </button>
                )}
              </div>

              {/* SEARCH AND FILTER */}
              <div className="flex flex-col gap-3 rounded-2xl border border-blue-50 bg-white p-4 shadow-sm sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-xl border border-blue-100 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#299BCF]"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#299BCF]"
                >
                  <option value="All">All Roles</option>
                  <option value="Patient">Patients</option>
                  <option value="Doctor">Doctors</option>
                  <option value="Receptionist">Receptionists</option>
                </select>
              </div>

              {/* USERS TABLE */}
              <div className="overflow-hidden rounded-2xl border border-blue-50 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-blue-50 p-5">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Registered Accounts
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {filteredUsers.length} accounts found
                    </p>
                  </div>
                  <Activity size={22} className="text-[#299BCF]" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-[#F1F8FD] text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-5 py-4">User</th>
                        <th className="px-5 py-4">Contact</th>
                        <th className="px-5 py-4">Role</th>
                        <th className="px-5 py-4 text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-blue-50">
                      {loadingUsers ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-10 text-center text-slate-500"
                          >
                            Loading accounts...
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="transition hover:bg-[#F8FBFE]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF3FC] font-bold text-[#299BCF]">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-700">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    ID: FC-{user.id.slice(-6)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="flex items-center gap-2 text-slate-600">
                                <Mail size={14} />
                                {user.email}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <div>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    user.role === "Doctor"
                                      ? "bg-blue-100 text-[#299BCF]"
                                      : user.role === "Receptionist"
                                        ? "bg-purple-100 text-purple-600"
                                        : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  {user.role}
                                </span>
                                {user.specialty && (
                                  <p className="mt-2 text-xs text-slate-400">
                                    {user.specialty}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              {user.role !== "Patient" ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    title={`Edit ${user.role.toLowerCase()}`}
                                    aria-label={`Edit ${user.role.toLowerCase()} ${user.name}`}
                                    onClick={() => openEditModal(user)}
                                    className="rounded-lg bg-blue-50 p-2 text-[#299BCF] hover:bg-blue-100"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    title={`Delete ${user.role.toLowerCase()}`}
                                    aria-label={`Delete ${user.role.toLowerCase()} ${user.name}`}
                                    onClick={() => void handleDelete(user)}
                                    className="rounded-lg bg-red-50 p-2 text-[#E51E2A] hover:bg-red-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ) : (
                                <p className="text-center text-xs text-slate-400">
                                  View only
                                </p>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {!loadingUsers && filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                      <Users
                        size={35}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="font-semibold text-slate-600">
                        No users found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Try another search or filter.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-50 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingUser ? "Edit Staff Account" : "Register New Staff"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Enter the account details below.
                </p>
              </div>

              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingUser(null);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-5">
              {formError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {formError}
                </p>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-blue-100 px-4 py-3 text-sm outline-none focus:border-[#299BCF]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@gmail.com"
                  className="w-full rounded-xl border border-blue-100 px-4 py-3 text-sm outline-none focus:border-[#299BCF]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  {editingUser
                    ? "New Password (optional)"
                    : "Temporary Password"}
                </label>
                <div className="relative">
                  <input
                    required={!editingUser}
                    type={showPassword ? "text" : "password"}
                    minLength={form.password ? 8 : undefined}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "At least 8 characters"
                    }
                    className="w-full rounded-xl border border-blue-100 px-4 py-3 pr-12 text-sm outline-none focus:border-[#299BCF]"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-blue-50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Account Role
                </label>
                <select
                  value={form.role}
                  disabled={!!editingUser}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as Role })
                  }
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#299BCF] disabled:bg-slate-100"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>

              {form.role === "Doctor" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Medical Specialty
                  </label>
                  <select
                    required
                    value={form.specialty}
                    onChange={(e) =>
                      setForm({ ...form, specialty: e.target.value })
                    }
                    className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#299BCF]"
                  >
                    <option value="" disabled>
                      Select a medical specialty
                    </option>
                    <option value="general consultation">
                      General consultation
                    </option>
                    <option value="dental care">Dental care</option>
                    <option value="optical care">Optical care</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 rounded-xl border border-blue-100 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#299BCF] py-3 text-sm font-bold text-white transition hover:bg-[#55B9E8]"
                >
                  {saving
                    ? editingUser
                      ? "Saving..."
                      : "Creating..."
                    : editingUser
                      ? "Save Changes"
                      : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
