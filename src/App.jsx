import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MemberDashboard = () => {
  const [members, setMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMembers, setFilteredMembers] = useState([])
  const [deleteModal, setDeleteModal] = useState({ show: false, memberId: null })

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportPassword, setExportPassword] = useState('')
  const [exportError, setExportError] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    const results = members.filter((member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredMembers(results)
  }, [searchTerm, members])

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('*')
    if (error) console.error('Error fetching members:', error)
    else setMembers(data)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) console.error('Error deleting member:', error)
    else {
      fetchMembers()
      setDeleteModal({ show: false, memberId: null })
    }
  }

  const handleExportPDF = () => {
    if (exportPassword !== '12345') {
      setExportError('Incorrect password. Please try again.')
      return
    }

    const { jsPDF } = window.jspdf
    const doc = new jsPDF()

    const tableColumn = ['Name', 'Phone', 'Address', 'Role', 'Date Added']
    const tableRows = []

    members.forEach(member => {
      const memberData = [
        member.name,
        member.phone,
        member.address,
        member.role || '-',
        new Date(member.created_at).toLocaleString(),
      ]
      tableRows.push(memberData)
    })

    doc.text('F3CCHURCH – Member List', 14, 15)
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    })

    doc.save('member_list.pdf')

    setShowExportModal(false)
    setExportPassword('')
    setExportError('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Member Dashboard</h1>

      <input
        type="text"
        placeholder="Search members..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border px-4 py-2 mb-4 w-full rounded"
      />

      <button
        onClick={() => setShowExportModal(true)}
        className="mb-4 bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800"
      >
        Export PDF
      </button>

      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Phone</th>
            <th className="py-2 px-4 border">Address</th>
            <th className="py-2 px-4 border">Role</th>
            <th className="py-2 px-4 border">Date Added</th>
            <th className="py-2 px-4 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((member) => (
            <tr key={member.id}>
              <td className="py-2 px-4 border">{member.name}</td>
              <td className="py-2 px-4 border">{member.phone}</td>
              <td className="py-2 px-4 border">{member.address}</td>
              <td className="py-2 px-4 border">{member.role || '-'}</td>
              <td className="py-2 px-4 border">
                {new Date(member.created_at).toLocaleString()}
              </td>
              <td className="py-2 px-4 border">
                <button
                  onClick={() => setDeleteModal({ show: true, memberId: member.id })}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this member?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal({ show: false, memberId: null })}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.memberId)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Enter Password to Export PDF</h2>
            <input
              type="password"
              value={exportPassword}
              onChange={(e) => setExportPassword(e.target.value)}
              placeholder="Enter password"
              className="border w-full px-4 py-2 rounded mb-2"
            />
            {exportError && <p className="text-red-600 mb-2">{exportError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-green-700 text-white rounded"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberDashboard
