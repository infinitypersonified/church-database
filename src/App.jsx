import React, { useState, useEffect } from 'react';
import supabase from './supabase';

function MemberList() {
  const [theme, setTheme] = useState('light');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', role: '', teamMember: false });
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching members:', error);
    else setMembers(data);
  };

  const closeModal = () => setSelectedMember(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('members').insert([formData]);
    setLoading(false);
    if (error) console.error('Error adding member:', error);
    else {
      setFormData({ name: '', phone: '', address: '', role: '', teamMember: false });
      fetchMembers();
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const deleteMember = async (id) => {
    if (password === '12345') {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) console.error('Error deleting member:', error);
      else fetchMembers();
    } else {
      alert('Incorrect password');
    }
  };

  const exportToPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tableColumn = ['Name', 'Phone', 'Address', 'Role', 'Date Added'];
    const tableRows = members.map((m) => [
      m.name,
      m.phone,
      m.address,
      m.role,
      new Date(m.created_at).toLocaleString(),
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows });
    doc.save('members.pdf');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <button onClick={toggleTheme} className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
        {theme === 'dark' ? <span className="text-yellow-300 text-xl">🌞</span> : <span className="text-gray-700 text-xl">🌙</span>}
      </button>

      <h1 className="text-3xl font-bold text-center mb-8 text-blue-900 dark:text-blue-300">F3CCHURCH — THE BRIDGE CHURCH</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-400">Add New Member</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="border dark:border-gray-600 rounded-lg px-4 py-2" />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="border dark:border-gray-600 rounded-lg px-4 py-2" />
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" required className="border dark:border-gray-600 rounded-lg px-4 py-2" />
        </div>

        {formData.teamMember && (
          <select name="role" value={formData.role} onChange={handleChange} className="border dark:border-gray-600 rounded-lg px-4 py-2 mt-4">
            <option value="">Select Role</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Sub Team">Sub Team</option>
            <option value="Senior Pastor">Senior Pastor</option>
            <option value="Admin">Admin</option>
          </select>
        )}

        <div className="mt-4 flex items-center">
          <input type="checkbox" name="teamMember" checked={formData.teamMember} onChange={(e) => setFormData({ ...formData, teamMember: e.target.checked })} className="mr-2" />
          <span>Team Member</span>
        </div>

        <button type="submit" className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition" disabled={loading}>
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
              <th className="py-3 px-6 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id} className="border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-700 cursor-pointer transition duration-150">
                  <td className="py-3 px-6">{member.name}</td>
                  <td className="py-3 px-6">{member.phone}</td>
                  <td className="py-3 px-6">{member.address}</td>
                  <td className="py-3 px-6">{member.role}</td>
                  <td className="py-3 px-6">{new Date(member.created_at).toLocaleString()}</td>
                  <td className="py-3 px-6">
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700" onClick={() => deleteMember(member.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center py-6 text-gray-500 italic">No members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={exportToPDF} className="mt-6 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition">Export to PDF</button>

      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl" onClick={closeModal}>
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-400">Member Details</h2>
            <p><strong>Name:</strong> {selectedMember.name}</p>
            <p><strong>Phone:</strong> {selectedMember.phone}</p>
            <p><strong>Address:</strong> {selectedMember.address}</p>
            <p><strong>Role:</strong> {selectedMember.role}</p>
            <p><strong>Added On:</strong> {new Date(selectedMember.created_at).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberList;
