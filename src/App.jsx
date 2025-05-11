import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import supabase from './supabase';

function MemberList() {
  const [theme, setTheme] = useState('light');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    teamMember: false,
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
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
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (error) console.error('Fetch error:', error);
    else setMembers(data);
  };

  const closeModal = () => setSelectedMember(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'teamMember') {
      setShowRole(checked);
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('members').insert([formData]);
    setLoading(false);
    if (error) console.error('Insert error:', error);
    else {
      setFormData({ name: '', phone: '', address: '', teamMember: false, role: '' });
      setShowRole(false);
      fetchMembers();
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleDelete = async (id) => {
    if (deletePassword !== '12345') {
      alert('Incorrect password');
      return;
    }
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) console.error('Delete error:', error);
    else fetchMembers();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['Name', 'Phone', 'Address', 'Team Member', 'Role', 'Date Added'];
    const tableRows = members.map(m => [
      m.name,
      m.phone,
      m.address,
      m.teamMember ? 'Yes' : 'No',
      m.role || 'N/A',
      new Date(m.created_at).toLocaleString()
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows });
    doc.save('member-list.pdf');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <button onClick={toggleTheme} className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700">
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>
      <h1 className="text-3xl font-bold text-center mb-8">F3CCHURCH — THE BRIDGE CHURCH</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="border p-2 rounded" />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required className="border p-2 rounded" />
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" required className="border p-2 rounded" />
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input type="checkbox" name="teamMember" checked={formData.teamMember} onChange={handleChange} className="mr-2" />
            Is Team Member?
          </label>
        </div>
        {showRole && (
          <div className="mt-2">
            <select name="role" value={formData.role} onChange={handleChange} className="border p-2 rounded">
              <option value="">Select Role</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Sub Team">Sub Team</option>
              <option value="Senior Pastor">Senior Pastor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        )}
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Saving...' : 'Add Member'}
        </button>
      </form>

      <div className="max-w-6xl mx-auto mt-10">
        <div className="mb-4 flex justify-between items-center">
          <input type="password" placeholder="Delete Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="border px-2 py-1 rounded" />
          <button onClick={exportPDF} className="bg-green-600 text-white px-4 py-2 rounded">Export to PDF</button>
        </div>

        <table className="w-full text-left border">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Address</th>
              <th className="p-2">Team Member</th>
              <th className="p-2">Role</th>
              <th className="p-2">Date</th>
              <th className="p-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="p-2">{m.name}</td>
                <td className="p-2">{m.phone}</td>
                <td className="p-2">{m.address}</td>
                <td className="p-2">{m.teamMember ? 'Yes' : 'No'}</td>
                <td className="p-2">{m.role || 'N/A'}</td>
                <td className="p-2">{new Date(m.created_at).toLocaleString()}</td>
                <td className="p-2">
                  <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4">No members found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2" onClick={closeModal}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Member Details</h2>
            <p><strong>Name:</strong> {selectedMember.name}</p>
            <p><strong>Phone:</strong> {selectedMember.phone}</p>
            <p><strong>Address:</strong> {selectedMember.address}</p>
            <p><strong>Team Member:</strong> {selectedMember.teamMember ? 'Yes' : 'No'}</p>
            <p><strong>Role:</strong> {selectedMember.role || 'N/A'}</p>
            <p><strong>Added On:</strong> {new Date(selectedMember.created_at).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberList;
