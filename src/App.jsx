import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPdfPasswordModal, setShowPdfPasswordModal] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    setFilteredMembers(
      members.filter((member) =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from("members").select("*");
    if (error) {
      console.error("Error fetching members:", error.message);
    } else {
      setMembers(data);
    }
  };

  const confirmDelete = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const deleteMember = async () => {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", selectedMember.id);
    if (error) {
      console.error("Error deleting member:", error.message);
    } else {
      fetchMembers();
      setShowDeleteModal(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredMembers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    XLSX.writeFile(workbook, "member_list.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Member List", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["Full Name", "Email", "Phone", "Age", "Gender"]],
      body: filteredMembers.map((member) => [
        member.full_name,
        member.email,
        member.phone,
        member.age,
        member.gender,
      ]),
    });
    doc.save("member_list.pdf");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Church Members</h1>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-full"
        />
        <button
          onClick={exportToExcel}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export as Excel
        </button>
        <button
          onClick={() => setShowPdfPasswordModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export as PDF
        </button>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Full Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Phone</th>
            <th className="border px-4 py-2">Age</th>
            <th className="border px-4 py-2">Gender</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((member) => (
            <tr key={member.id}>
              <td className="border px-4 py-2">{member.full_name}</td>
              <td className="border px-4 py-2">{member.email}</td>
              <td className="border px-4 py-2">{member.phone}</td>
              <td className="border px-4 py-2">{member.age}</td>
              <td className="border px-4 py-2">{member.gender}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => confirmDelete(member)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete {selectedMember?.full_name}?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={deleteMember}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Password Modal */}
      {showPdfPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-4">Enter Password to Export PDF</h2>
            <input
              type="password"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              placeholder="Enter password"
              className="border w-full px-4 py-2 rounded mb-4"
            />
            {pdfError && <p className="text-red-600 mb-2">{pdfError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPdfPasswordModal(false);
                  setPdfPassword("");
                  setPdfError("");
                }}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pdfPassword === "12345") {
                    exportToPDF();
                    setShowPdfPasswordModal(false);
                    setPdfPassword("");
                    setPdfError("");
                  } else {
                    setPdfError("Incorrect password. Try again.");
                  }
                }}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
