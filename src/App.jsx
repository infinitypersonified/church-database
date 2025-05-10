import React, { useState, useEffect } from 'react';
import supabase from './supabase';

function MemberList() {
  const [theme, setTheme] = useState('light');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', isTeamMember: false, role: '' });
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
    } else {
      setMembers(data);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'isTeamMember') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('members').insert([formData]);
    setLoading(false);
    if (error) {
      console.error('Error adding member:', error);
    } else {
      setFormData({ name: '', phone: '', address: '', isTeamMember: false, role: '' });
      fetchMembers();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const confirmDelete = (member) => {
    setMemberToDelete(member);
    setShowPasswordModal(true);
    setError('');
  };

  const handleDelete = async () => {
    if (password === '12345') {
      if (!memberToDelete?.id) {
        setError('No member selected to delete.');
        return;
      }

      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberToDelete.id);

      if (error) {
        console.error('Error deleting member:', error);
        setError('Error deleting member');
      } else {
        fetchMembers();
        setShowPasswordModal(false);
        setPassword('');
        setError('');
      }
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>

      <h1 className="text-3xl font-bold text-center mb-8 text-blue-900 dark:text-blue-300">
        F3CCHURCH — THE BRIDGE CHURCH
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-400">Add New Member</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="border dark:border-gray-600 rounded-lg px-4 py-2" />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="border dark:border-gray-600 rounded-lg px-4 py-2" />
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" required className="border dark:border-gray-600 rounded-lg px-4 py-2" />
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isTeamMember" checked={formData.isTeamMember} onChange={handleChange} />
            Team Member
          </label>
           {/* Role Input (only appears if Team Member is checked) */}
        {formData.isTeamMember && (
          <div className="mt-4">
            <label htmlFor="role" className="block text-blue-800 dark:text-blue-400 mb-2">
              Role (Optional)
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Role (e.g. Volunteer, Admin)"
              className="border dark:border-gray-600 rounded-lg px-4 py-2 w-full"
            />
          </div>
        )}
        </div>

        <button type="submit" className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800" disabled={loading}>
          {loading ? 'Saving...' : 'Add Member'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <thead>
            <tr className="bg-blue-700 dark:bg-blue-900 text-white">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Phone</th>
              <th className="py-3 px-6 text-left">Address</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-left">Date Added</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id} className="border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-700">
                  <td className="py-3 px-6">{member.name}</td>
                  <td className="py-3 px-6">{member.phone}</td>
                  <td className="py-3 px-6">{member.address}</td>
                  <td className="py-3 px-6">{member.role || '-'}</td>
                  <td className="py-3 px-6">{new Date(member.created_at).toLocaleString()}</td>
                  <td className="py-3 px-6">
                    <button onClick={() => confirmDelete(member)} className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 italic">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-4">Enter Password to Delete</h2>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="border w-full px-4 py-2 rounded mb-4" />
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 text-white">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberList;
