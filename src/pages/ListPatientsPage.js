"use client"

import { useState, useEffect } from "react"

import { useNavigate } from "react-router-dom"

import "./ListPatientsPage.css"

export default function ListPatientsPage() {
  const [patients, setPatients] = useState([])

  const [loading, setLoading] = useState(true)

  const [showEditModal, setShowEditModal] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState(null)

  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "" })

  const [addForm, setAddForm] = useState({ name: "", phone: "", email: "" })

  const [actionLoading, setActionLoading] = useState(false)

  const [selectedPatients, setSelectedPatients] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [patientsPerPage] = useState(10) // 10 patients par page

  const navigate = useNavigate()

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")

    return {
      Authorization: `Token ${token}`,

      "Content-Type": "application/json",
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")

    const role = localStorage.getItem("role")

    // 🔒 Vérifier que l'utilisateur est admin et connecté

    if (!token || role !== "admin") {
      navigate("/login")

      return
    }

    fetchPatients()
  }, [navigate])

  const fetchPatients = () => {
    const token = localStorage.getItem("token")

    // ✅ Récupérer la liste des patients

    fetch("http://127.0.0.1:8000/api/listpatients/", {
      headers: {
        Authorization: `Token ${token}`,

        "Content-Type": "application/json",
      },
    })

      .then((res) => res.json())

      .then((data) => {
        setPatients(data)

        setLoading(false)
      })

      .catch((err) => {
        console.error(err)

        setLoading(false)
      })
  }

  const handlePrint = () => {
    window.print()
  }

  // Calculer les patients pour la page courante
  const indexOfLastPatient = currentPage * patientsPerPage
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient)
  const totalPages = Math.ceil(patients.length / patientsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleSelectPatient = (patientId) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId) ? prev.filter((id) => id !== patientId) : [...prev, patientId],
    )
  }

  const handleSelectAll = () => {
    const currentPatientIds = currentPatients.map((p) => p.id)
    if (currentPatientIds.every((id) => selectedPatients.includes(id))) {
      // Désélectionner tous les patients de la page courante
      setSelectedPatients((prev) => prev.filter((id) => !currentPatientIds.includes(id)))
    } else {
      // Sélectionner tous les patients de la page courante
      setSelectedPatients((prev) => [...new Set([...prev, ...currentPatientIds])])
    }
  }

  const handleEditClick = (patient) => {
    setSelectedPatient(patient)

    setEditForm({
      name: patient.name,

      phone: patient.phone,

      email: patient.email,

      password: "",
    })

    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    setActionLoading(true)

    const { name, phone, email, password } = editForm

    if (phone && email) {
      alert(
        "Vous ne pouvez pas modifier le téléphone et l'email en même temps. Modifiez soit le nom et l'email, soit le nom et le téléphone.",
      )

      return
    }

    if (!phone && !email) {
      alert("Veuillez remplir soit le téléphone, soit l'email.")

      return
    }

    if (!name) {
      alert("Le nom est obligatoire.")

      return
    }

    if (!password || password.length !== 4) {
      alert("Le mot de passe doit contenir exactement 4 caractères.")

      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/patients/${selectedPatient.id}/`, {
        method: "PUT",

        headers: getAuthHeaders(),

        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        fetchPatients()

        setShowEditModal(false)

        setSelectedPatient(null)
      } else {
        alert("Erreur lors de la modification")
      }
    } catch (error) {
      console.error("Erreur:", error)

      alert("Erreur lors de la modification")
    }

    setActionLoading(false)
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()

    setActionLoading(true)

    const { name, phone, email, password } = addForm // ✅ extrait

    if (phone && email) {
      alert(
        "Vous ne pouvez pas ajouter le téléphone et l'email en même temps. Ajoutez soit le nom et l'email, soit le nom et le téléphone.",
      )

      return
    }

    if (!password || password.length !== 4) {
      alert("Le mot de passe doit contenir exacrement 4 caractères.")

      return
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/patients/", {
        method: "POST",

        headers: getAuthHeaders(),

        body: JSON.stringify(addForm),
      })

      if (response.ok) {
        fetchPatients()

        setShowAddModal(false)

        setAddForm({ name: "", phone: "", email: "", password: "" })
      } else {
        alert("Erreur lors de l'ajout")
      }
    } catch (error) {
      console.error("Erreur:", error)

      alert("Erreur lors de l'ajout")
    }

    setActionLoading(false)
  }

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient)

    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    setActionLoading(true)

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/patients/${selectedPatient.id}/`, {
        method: "DELETE",

        headers: getAuthHeaders(),
      })

      if (response.ok) {
        fetchPatients()

        setShowDeleteModal(false)

        setSelectedPatient(null)
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur:", error)

      alert("Erreur lors de la suppression")
    }

    setActionLoading(false)
  }

  const handleBlockToggle = async (patient) => {
    setActionLoading(true)

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/patients/${patient.id}/block/`, {
        method: "POST",

        headers: getAuthHeaders(),

        body: JSON.stringify({ blocked: !patient.is_blocked }),
      })

      if (response.ok) {
        fetchPatients()
      } else {
        alert("Erreur lors du blocage/déblocage")
      }
    } catch (error) {
      console.error("Erreur:", error)

      alert("Erreur lors du blocage/déblocage")
    }

    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>

        <h2 className="loading-text">Chargement...</h2>
      </div>
    )
  }

  return (
    <div className="patients-container">
      <div className="patients-header">
        <h1 className="patients-title">Liste des Patients</h1>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="print-style-btn" onClick={handlePrint}>
            🖨️ Imprimer
          </button>
          <button className="add-patient-btn" onClick={() => setShowAddModal(true)}>
            + Ajouter Patient
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={
                    currentPatients.length > 0 &&
                    currentPatients.every((patient) => selectedPatients.includes(patient.id))
                  }
                  onChange={handleSelectAll}
                />
              </th>

              <th className="name-col">Name</th>

              <th className="email-col">Email</th>

              <th className="phone-col">Phone</th>

              <th>Mot de passe</th>

              <th className="status-col">Status</th>

              <th className="actions-col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentPatients.map((patient) => (
              <tr key={patient.id} className={selectedPatients.includes(patient.id) ? "selected" : ""}>
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedPatients.includes(patient.id)}
                    onChange={() => handleSelectPatient(patient.id)}
                  />
                </td>

                <td className="name-col">
                  <div className="name-cell">
                    <div className="patient-avatar">{patient.name.charAt(0).toUpperCase()}</div>

                    <span className="patient-name">{patient.name}</span>
                  </div>
                </td>

                <td className="email-col">{patient.email}</td>

                <td className="phone-col">{patient.phone}</td>

                <td>••••</td>

                <td className="status-col">
                  <span className={`status-badge ${patient.is_blocked ? "blocked" : "active"}`}>
                    {patient.is_blocked ? "Bloqué" : "Actif"}
                  </span>
                </td>

                <td className="actions-col">
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditClick(patient)}
                      disabled={actionLoading}
                      title="Modifier"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />

                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    <button
                      className={`action-btn ${patient.is_blocked ? "unblock-btn" : "block-btn"}`}
                      onClick={() => handleBlockToggle(patient)}
                      disabled={actionLoading}
                      title={patient.is_blocked ? "Débloquer" : "Bloquer"}
                    >
                      {patient.is_blocked ? (
                        // Patient bloqué = Cadenas FERMÉ

                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />

                          <circle cx="12" cy="16" r="1" />

                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      ) : (
                        // Patient actif = Cadenas OUVERT

                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />

                          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        </svg>
                      )}
                    </button>

                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteClick(patient)}
                      disabled={actionLoading}
                      title="Supprimer"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />

                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Affichage de {indexOfFirstPatient + 1} à {Math.min(indexOfLastPatient, patients.length)} sur{" "}
            {patients.length} patients
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
              ← Précédent
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`pagination-number ${currentPage === pageNumber ? "active" : ""}`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Modal d'édition */}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Modifier Patient</h2>

              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Nom:</label>

                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Téléphone:</label>

                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email:</label>

                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password:</label>

                <input
                  type="text" // ✅ Champ visible
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Annuler
                </button>

                <button type="submit" className="save-btn" disabled={actionLoading}>
                  {actionLoading ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Ajouter Patient</h2>

              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label>Nom:</label>

                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Téléphone:</label>

                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email:</label>

                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password:</label>

                <input
                  type="text" // ✅ Champ visible
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>

                <button type="submit" className="save-btn" disabled={actionLoading}>
                  {actionLoading ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression */}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2>Supprimer Patient</h2>

              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <p>
                Êtes-vous sûr de vouloir supprimer le patient <strong>{selectedPatient?.name}</strong> ?
              </p>

              <p className="warning-text">Cette action est irréversible.</p>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>

              <button
                type="button"
                className="delete-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
