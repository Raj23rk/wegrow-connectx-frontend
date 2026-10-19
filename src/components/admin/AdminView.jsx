import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck, Users, MessageSquare, FolderGit2, Calendar, Plus,
  Key, Trash2, Check, X, AlertTriangle
} from 'lucide-react';

export const AdminView = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [resetPwUserId, setResetPwUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Add user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('Welcome@123');
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newEmpId, setNewEmpId] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [newBrands, setNewBrands] = useState(['wegrow']);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers()
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminUser({
        name: newName,
        email: newEmail,
        password: newPass,
        title: newTitle,
        department: newDept,
        empId: newEmpId,
        role: newRole,
        brands: newBrands
      });
      setIsAddUserOpen(false);
      setActionSuccess('Team member created successfully!');
      setTimeout(() => setActionSuccess(''), 4000);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateAdminUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPwUserId || !newPassword) return;
    try {
      await api.resetAdminPassword(resetPwUserId, newPassword);
      setResetPwUserId(null);
      setNewPassword('');
      setActionSuccess('Password reset successfully!');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      await api.deleteAdminUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setActionSuccess('User deleted');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-sm">
          <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-900 dark:text-white">Access Restricted</h3>
          <p className="text-xs text-gray-500 mt-1">This console is only accessible by platform administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] dark:bg-[#1E1E1E] min-w-0 overflow-y-auto p-4 md:p-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#0A2A8C] dark:text-blue-400" />
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Administration & Governance Console
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage organization members, brand access, security roles, and system health
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-[#0A2A8C] hover:bg-blue-900 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold">Team Members</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats?.users || users.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold">Active Channels</span>
            <MessageSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats?.channels || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold">Messages</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats?.messages || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold">Files Shared</span>
            <FolderGit2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats?.files || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold">Meetings</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats?.events || 0}
          </div>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="bg-white dark:bg-[#282828] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-extrabold text-sm text-gray-900 dark:text-white">
          Team Member Directory ({users.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-bold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Branch & Contact</th>
                <th className="py-3 px-4">Department & Title</th>
                <th className="py-3 px-4">Brands</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20 text-gray-800 dark:text-gray-200">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center flex-none shadow-xs"
                        style={{ backgroundColor: u.color || '#5B5FC7' }}
                      >
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {u.name}
                          {u.empId && <span className="text-[10px] font-mono text-gray-400 font-normal">({u.empId})</span>}
                        </div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{u.branch || 'Corporate HQ'}</div>
                    {u.phone && <div className="text-[11px] font-mono text-emerald-600">{u.phone}</div>}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold">{u.title || 'Member'}</div>
                    <div className="text-[11px] text-gray-400">{u.department || 'General'}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.brands?.map(b => (
                        <span key={b} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4 capitalize font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${u.status === 'available' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => { setResetPwUserId(u._id); setNewPassword('Welcome@123'); }}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                      title="Reset Password"
                    >
                      <Key className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-pop">
          <div className="bg-white dark:bg-[#282828] w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Add New Team Member</h3>
              <button type="button" onClick={() => setIsAddUserOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@wegrow.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="Trainer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Academics"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0A2A8C] text-white font-bold hover:bg-blue-900"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPwUserId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-pop">
          <div className="bg-white dark:bg-[#282828] w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-2">Reset User Password</h3>
            <p className="text-xs text-gray-500 mb-4">Set a new temporary password for this account.</p>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPwUserId(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
