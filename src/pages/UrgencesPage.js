"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./UrgencesPage.css"

const UrgencesPage = () => {
  const [urgences, setUrgences] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedUrgences, setSelectedUrgences] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedUrgence, setSelectedUrgence] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

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

    fetchUrgences()
  }, [navigate])

  const fetchUrgences = () => {
    const token = localStorage.getItem("token")
    setLoading(true)
    setError(null)

    // ✅ Récupérer la liste des urgences
    fetch("http://127.0.0.1:8000/api/urgences/", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        setUrgences(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des urgences:", err)
        setError(err.message)
        setLoading(false)
      })
  }

  const handleSelectUrgence = (urgenceId) => {
    setSelectedUrgences((prev) =>
      prev.includes(urgenceId) ? prev.filter((id) => id !== urgenceId) : [...prev, urgenceId],
    )
  }

  const handleSelectAll = () => {
    if (selectedUrgences.length === urgences.length) {
      setSelectedUrgences([])
    } else {
      setSelectedUrgences(urgences.map((urgence) => urgence.id))
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 2:
        return "priority-critique"
      case 1:
        return "priority-urgent"
      case 0:
      default:
        return "priority-normal"
    }
  }

  const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "en_attente":
    case "acceptee":
    case "ambulance_affectee":
      return "status-waiting";

    case "en_route_vers_victime":
    case "arrivee_sur_place":
    case "prise_en_charge":
    case "en_route_vers_base":
    case "en_cours":
      return "status-progress";

    case "terminee":
    case "termine":
    case "refusee":
      return "status-completed";

    default:
      return "status-waiting";
  }
};

  const handleViewDetails = async (urgenceId) => {
    setDetailLoading(true)
    setShowDetailModal(true)

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/urgences/${urgenceId}/`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setSelectedUrgence(data)
    } catch (err) {
      console.error("Erreur lors de la récupération des détails:", err)
      alert("Erreur lors du chargement des détails")
      setShowDetailModal(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDeleteUrgence = async (urgenceId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette urgence ?")) {
      return
    }

    setActionLoading(true)

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/delete_urgence/${urgenceId}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      // Actualiser la liste après suppression
      fetchUrgences()
      alert("Urgence supprimée avec succès")
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
      alert("Erreur lors de la suppression de l'urgence")
    } finally {
      setActionLoading(false)
    }
  }

  // Fonction pour formater le nom complet du patient
  const formatPatientName = (patient) => {
    if (!patient) return "N/A"
    const name = patient.name || ""
    const prenom = patient.prenom || ""
    return `${prenom} ${name}`.trim() || "N/A"
  }

  // Fonction pour formater le type d'urgence
  const formatTypeUrgence = (type) => {
    const types = {
      accident: "Accident de la route",
      brulure: "Brûlure",
      crise_cardiaque: "Crise cardiaque",
      traumatisme: "Traumatisme",
      autre: "Autre"
    }
    return types[type] || type || "Non spécifié"
  }

  // Fonction pour formater le statut
  const formatStatus = (statut) => {
  const statuts = {
    en_attente: "En attente",
    acceptee: "Acceptée",
    refusee: "Refusée",
    ambulance_affectee: "Ambulance affectée",
    en_route_vers_victime: "En route vers la victime",
    arrivee_sur_place: "Arrivée sur place",
    prise_en_charge: "Prise en charge",
    en_route_vers_base: "En route vers la base",
    en_cours: "En cours",
    terminee: "Terminée",
    termine: "Terminé" // au cas où
  };
  return statuts[statut] || "Non spécifié";
};

  // Fonction pour formater l'état des victimes
  const formatEtatVictime = (etat) => {
    const etats = {
      oui: "Oui",
      non: "Non",
      nsp: "Ne sait pas"
    }
    return etats[etat] || "Non spécifié"
  }

  if (loading) {
    return (
      <div className="urgences-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des urgences...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="urgences-page">
        <div className="error-container">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={fetchUrgences} className="retry-btn">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="urgences-page">
      <div className="page-header">
        <h1>Gestion des Urgences</h1>
        <div className="header-actions" style={{ display: "flex", gap: "10px" }}>
  <button
    onClick={fetchUrgences}
    className="print-style-btn"
    disabled={actionLoading}
  >
    🔄 Actualiser
  </button>
</div>
      </div>

      <div className="urgences-stats">
        <div className="stat-card">
          <h3>Total</h3>
          <span className="stat-number">{urgences.length}</span>
        </div>
        <div className="stat-card critique">
          <h3>Critiques</h3>
          <span className="stat-number">{urgences.filter((u) => u.priorite === 2).length}</span>
        </div>
        <div className="stat-card urgent">
          <h3>Urgents</h3>
          <span className="stat-number">{urgences.filter((u) => u.priorite === 1).length}</span>
        </div>
        <div className="stat-card progress">
          <h3>En cours</h3>
          <span className="stat-number">{urgences.filter((u) => u.statut?.toLowerCase() === "en_cours").length}</span>
        </div>
      </div>

      {urgences.length === 0 ? (
        <div className="empty-state">
          <h3>Aucune urgence</h3>
          <p>Il n'y a actuellement aucune urgence enregistrée.</p>
        </div>
      ) : (
        <div className="urgences-container">
          <div className="table-controls">
            <div className="selection-info">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedUrgences.length === urgences.length}
                  onChange={handleSelectAll}
                />
                <span className="checkmark"></span>
                Tout sélectionner ({selectedUrgences.length} sélectionné{selectedUrgences.length > 1 ? "s" : ""})
              </label>
            </div>
          </div>

          <div className="urgences-table">
            <div className="table-header" style={{ gridTemplateColumns: "80px 200px 250px 120px 120px 180px 120px" }}>
              <div className="header-cell">Sélection</div>
              <div className="header-cell">Patient</div>
              <div className="header-cell">Motif</div>
              <div className="header-cell">Priorité</div>
              <div className="header-cell">Statut</div>
              <div className="header-cell">Date/Heure</div>
              <div className="header-cell">Actions</div>
            </div>

            {urgences.map((urgence) => (
              <div
                key={urgence.id}
                className="table-row"
                style={{ gridTemplateColumns: "80px 200px 250px 120px 120px 180px 120px" }}
              >
                <div className="table-cell">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedUrgences.includes(urgence.id)}
                      onChange={() => handleSelectUrgence(urgence.id)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
                <div className="table-cell">
                  <div className="patient-info">
                    <strong>{formatPatientName(urgence.patient)}</strong>
                    <small>{urgence.patient?.telephone || ""}</small>
                  </div>
                </div>
                <div className="table-cell">
                  <div className="motif-info">
                    <strong>{formatTypeUrgence(urgence.type_urgence)}</strong>
                    {urgence.description && <small>{urgence.description.substring(0, 50)}...</small>}
                  </div>
                </div>
                <div className="table-cell">
                  <span className={`priority-badge ${getPriorityClass(urgence.priorite)}`}>
                    {urgence.priorite === 2 ? "Critique" : urgence.priorite === 1 ? "Urgent" : "Normal"}
                  </span>
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${getStatusClass(urgence.statut)}`}>
                    {formatStatus(urgence.statut)}
                  </span>
                </div>
                <div className="table-cell">
                  <div className="date-info">
                    <strong>{new Date(urgence.date_signalee).toLocaleDateString()}</strong>
                    <small>{new Date(urgence.date_signalee).toLocaleTimeString()}</small>
                  </div>
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      title="Voir détails"
                      onClick={() => handleViewDetails(urgence.id)}
                      disabled={actionLoading}
                    >
                      👁️
                    </button>
                    <button
                      className="action-btn delete"
                      title="Supprimer"
                      onClick={() => handleDeleteUrgence(urgence.id)}
                      disabled={actionLoading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'Urgence</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="modal-loading">
                <div className="loading-spinner"></div>
                <p>Chargement des détails...</p>
              </div>
            ) : selectedUrgence ? (
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Informations Patient</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Nom :</label>
                      <span>{selectedUrgence.patient?.name || "Non spécifié"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Prénom :</label>
                      <span>{selectedUrgence.patient?.prenom || "Non spécifié"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Contact :</label>
<span>
  {selectedUrgence.patient?.phone || selectedUrgence.patient?.email || "Non spécifié"}
</span>

                    </div>
                    <div className="detail-item">
                      <label>Âge :</label>
                      <span>{selectedUrgence.patient?.age || "Non spécifié"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Sexe :</label>
                      <span>{selectedUrgence.patient?.sexe || "Non spécifié"}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Détails de l'Urgence</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Type d'urgence :</label>
                      <span>{formatTypeUrgence(selectedUrgence.type_urgence)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Description :</label>
                      <span>{selectedUrgence.description || "Aucune description"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Priorité :</label>
                      <span className={`priority-badge ${getPriorityClass(selectedUrgence.priorite)}`}>
                        {selectedUrgence.priorite === 2
                          ? "Critique"
                          : selectedUrgence.priorite === 1
                            ? "Urgent"
                            : "Normal"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Statut :</label>
                      <span className={`status-badge ${getStatusClass(selectedUrgence.statut)}`}>
                        {formatStatus(selectedUrgence.statut)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Nombre total de victimes :</label>
                      <span>{selectedUrgence.nombre_total_victimes || "Non spécifié"}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>État de la Victime Principale</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Âge approximatif :</label>
                      <span>{selectedUrgence.age_approximatif_victime_principale || "Non spécifié"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Consciente :</label>
                      <span
                        className={`etat-badge ${
                          selectedUrgence.victime_principale_consciente === "oui"
                            ? "etat-oui"
                            : selectedUrgence.victime_principale_consciente === "non"
                              ? "etat-non"
                              : "etat-nsp"
                        }`}
                      >
                        {formatEtatVictime(selectedUrgence.victime_principale_consciente)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Respire :</label>
                      <span
                        className={`etat-badge ${
                          selectedUrgence.victime_principale_respire === "oui"
                            ? "etat-oui"
                            : selectedUrgence.victime_principale_respire === "non"
                              ? "etat-non"
                              : "etat-nsp"
                        }`}
                      >
                        {formatEtatVictime(selectedUrgence.victime_principale_respire)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Saignement important :</label>
                      <span
                        className={`etat-badge ${
                          selectedUrgence.victime_principale_saignement_important === "oui"
                            ? "etat-non"
                            : selectedUrgence.victime_principale_saignement_important === "non"
                              ? "etat-oui"
                              : "etat-nsp"
                        }`}
                      >
                        {formatEtatVictime(selectedUrgence.victime_principale_saignement_important)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Parle :</label>
                      <span
                        className={`etat-badge ${
                          selectedUrgence.victime_principale_parle === "oui"
                            ? "etat-oui"
                            : selectedUrgence.victime_principale_parle === "non"
                              ? "etat-non"
                              : "etat-nsp"
                        }`}
                      >
                        {formatEtatVictime(selectedUrgence.victime_principale_parle)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Localisation</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Adresse lisible :</label>
                      <span>{selectedUrgence.adresse_lisible || "Non spécifiée"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Latitude :</label>
                      <span>{selectedUrgence.latitude !== null ? selectedUrgence.latitude : "Non spécifiée"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Longitude :</label>
                      <span>{selectedUrgence.longitude !== null ? selectedUrgence.longitude : "Non spécifiée"}</span>
                    </div>
                  </div>
                </div>

                {selectedUrgence.ambulance && (
                  <div className="detail-section">
                    <h3>Ambulance Assignée</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Numéro :</label>
                        <span>{selectedUrgence.ambulance.numero_ambulance}</span>
                      </div>
                      <div className="detail-item">
                        <label>Chauffeur :</label>
                        <span>{selectedUrgence.ambulance.nom_chauffeur}</span>
                      </div>
                      <div className="detail-item">
                        <label>Téléphone chauffeur :</label>
                        <span>{selectedUrgence.ambulance.telephone_chauffeur}</span>
                      </div>
                      <div className="detail-item">
                        <label>Statut ambulance :</label>
                        <span>{selectedUrgence.ambulance.statut}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Informations Système</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Date signalée :</label>
                      <span>{new Date(selectedUrgence.date_signalee).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedUrgence.image && (
                  <div className="detail-section">
                    <h3>Image</h3>
                    <img
                      src={selectedUrgence.image}
                      alt="Image de l'urgence"
                      className="urgence-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default UrgencesPage