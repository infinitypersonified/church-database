import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function MemberList() {
  const [theme, setTheme] = useState('light');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', role: '', teamMember: false });
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Theme setup on component mount
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
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch members from Supabase on load
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

  const closeModal = () => setSelectedMember(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('members').insert([formData]);
    setLoading(false);
    if (error) {
      console.error('Error adding member:', error);
    } else {
      setFormData({ name: '', phone: '', address: '', role: '', teamMember: false });
      fetchMembers(); // Refresh list after new member is added
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const deleteMember = async (id) => {
    if (password === '12345') {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) {
        console.error('Error deleting member:', error);
      } else {
        fetchMembers(); // Refresh list after deleting member
      }
    } else {
      alert('Incorrect password');
    }
  };

  const handlePasswordChange = (e) => setPassword(e.target.value);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['Name', 'Phone', 'Address', 'Role', 'Date Added'];
    const tableRows = members.map((member) => [
      member.name,
      member.phone,
      member.address,
      member.role,
      new Date(member.created_at).toLocaleString(),
    ]);

    doc.autoTable(tableColumn, tableRows);
    doc.save('members.pdf');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        {theme === 'dark' ? (
          <span className="text-yellow-300 text-xl">🌞</span>
        ) : (
          <span className="text-gray-700 text-xl">🌙</span>
        )}
      </button>

      <h1 className="text-3xl font-bold text-center mb-8 text-blue-900 dark:text-blue-300">
        F3CCHURCH — THE BRIDGE CHURCH
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10 max-w-2xl mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-400">Add New Member</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="border dark:border-gray-600 rounded-lg px-4 py-2"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="border dark:border-gray-600 rounded-lg px-4 py-2"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            required
            className="border dark:border-gray-600 rounded-lg px-4 py-2"
          />
        </div>

       {/* Team Member Checkbox */}
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            name="isTeamMember"
            checked={formData.isTeamMember}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          <label className="text-blue-800 dark:text-blue-400">Team Member</label>
        </div>

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

        <button
          type="submit"
          className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Add Member'}
        </button>
      </form>

      {/* Member table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <thead>
            <tr className="bg-blue-700 dark:bg-blue-900 text-white">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Phone</th>
              <th className="py-3 px-6 text-left">Address</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-left">Date Added</th>
              <th className="py-3 px-6 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-700 cursor-pointer transition duration-150"
                >
                  <td className="py-3 px-6">{member.name}</td>
                  <td className="py-3 px-6">{member.phone}</td>
                  <td className="py-3 px-6">{member.address}</td>
                  <td className="py-3 px-6">{member.role}</td>
                  <td className="py-3 px-6">{new Date(member.created_at).toLocaleString()}</td>
                  <td className="py-3 px-6">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPasswordModalOpen(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 italic">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Export to PDF Button */}
      <button
        onClick={exportToPDF}
        className="mt-6 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
      >
        Export to PDF
      </button>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4">Enter Password to Delete</h2>
            <input
              type="password"
              className="border dark:border-gray-600 rounded-lg px-4 py-2 mb-4 w-full"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Password"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedMember) {
                    deleteMember(selectedMember.id);
                  }
                  setIsPasswordModalOpen(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberList;
