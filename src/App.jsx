// Full Member Management Page with Add Form and Popup Modal for F3CCHURCH - THE BRIDGE CHURCH
import { useEffect, useState } from "react";
import supabase from "./supabase";

function MemberList() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching members:", error);
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
    const { data, error } = await supabase.from("members").insert([formData]);
    setLoading(false);
    if (error) {
      console.error("Error adding member:", error);
    } else {
      setFormData({ name: "", phone: "", address: "" });
      fetchMembers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 font-sans">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-blue-900">
        F3CCHURCH — THE BRIDGE CHURCH
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 mb-10 max-w-2xl mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Add New Member</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="border rounded-lg px-4 py-2"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="border rounded-lg px-4 py-2"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            required
            className="border rounded-lg px-4 py-2"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Member"}
        </button>
      </form>

      {/* Member Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-xl">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Phone</th>
              <th className="py-3 px-6 text-left">Address</th>
              <th className="py-3 px-6 text-left">Date Added</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="border-b hover:bg-blue-50 cursor-pointer transition duration-150"
                >
                  <td className="py-3 px-6">{member.name}</td>
                  <td className="py-3 px-6">{member.phone}</td>
                  <td className="py-3 px-6">{member.address}</td>
                  <td className="py-3 px-6">
                    {new Date(member.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Member Details</h2>
            <p><strong>Name:</strong> {selectedMember.name}</p>
            <p><strong>Phone:</strong> {selectedMember.phone}</p>
            <p><strong>Address:</strong> {selectedMember.address}</p>
            <p><strong>Added On:</strong> {new Date(selectedMember.created_at).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberList;
