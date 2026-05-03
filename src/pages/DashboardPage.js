"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./DashboardPage.css"

function DashboardPage() {
  const [stats, setStats] = useState({
    patients: { count: 0, change: 0 },
    doctors: { count: 0, change: 0 },
    ambulances: { count: 0, change: 0 },
    urgences: { count: 0, change: 0 },
  })

  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const navigate = useNavigate()

  // Navigation items
  const navItems = [
    {
      id: "dashboard",
      label: "Tableau de bord ",
      icon: "📊",
      path: "/dashboard",
      active: true,
    },
    {
      id: "patients",
      label: "Liste des patients",
      icon: "👥",
      path: "/listpatients/",
      active: false,
    },
    {
      id: "doctors",
      label: "Liste des Docteurs",
      icon: "👨‍⚕️",
      path: "/listdocteur/",
      active: false,
    },
    {
      id: "ambulances",
      label: "Ambulances",
      icon: "🚑",
      path: "/ambulances/",
      active: false,
    },
    {
      id: "urgences",
      label: "Cas d’urgence",
      icon: "🚨",
      path: "/urgences/",
      active: false,
    },
    {
      id: "logout",
      label: "Déconnexion",  
      icon: "🚪",
      path: "/logout",
      active: false,
    },
  ]

  // Vérification d'accès + chargement des stats
  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    // ✅ Vérifier que l'utilisateur est connecté ET admin
    if (!token || role !== "admin") {
      navigate("/")
      return
    }
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // Simulate API calls
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const resPatients = await fetch("http://127.0.0.1:8000/api/listpatients/", {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })
        const dataPatients = await resPatients.json()

        // === Si tu veux : tu peux faire pareil pour docteurs ===
        const resDoctors = await fetch("http://127.0.0.1:8000/api/listdocteur/", {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })
        const dataDoctors = await resDoctors.json()

        const resAmbulances = await fetch("http://127.0.0.1:8000/api/ambulances/", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    const dataAmbulances = await resAmbulances.json()

    // 🚨 Urgences
    const resUrgences = await fetch("http://127.0.0.1:8000/api/urgences/", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    const dataUrgences = await resUrgences.json()

    // Charger anciennes valeurs
        const prevStats = JSON.parse(localStorage.getItem("prevStats")) || {
          patients: 0,
          doctors: 0,
          ambulances: 0,
          urgences: 0,
        }

        // Nouvelles valeurs
        const newPatients = dataPatients.length
        const newDoctors = dataDoctors.length
        const newAmbulances = dataAmbulances.length
        const newUrgences = dataUrgences.length

        // Calcul du changement
        const changePatients = newPatients - prevStats.patients
        const changeDoctors = newDoctors - prevStats.doctors
        const changeAmbulances = newAmbulances - prevStats.ambulances
        const changeUrgences = newUrgences - prevStats.urgences

        setStats({
          patients: { count: dataPatients.length, change: changePatients },
          doctors: { count: dataDoctors.length, change: changeDoctors },
          ambulances: { count: dataAmbulances.length, change: -changeAmbulances },
          urgences: { count: dataUrgences.length, change: changeUrgences },
        })

        localStorage.setItem(
          "prevStats",
          JSON.stringify({
            patients: newPatients,
            doctors: newDoctors,
            ambulances: newAmbulances,
            urgences: newUrgences,
          })
        )
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [navigate])

  // Handle navigation
  const handleNavigation = (item) => {
    if (item.id === "dashboard") {
      setCurrentPage("dashboard")
    } else if (item.id === "logout") {
      // Supprimer le token et les données de session
      localStorage.removeItem("token")
      localStorage.removeItem("role")
      // Rediriger vers la page de connexion
      navigate("/")
    } else {
      // Navigate to other pages
      window.location.href = item.path
    }
  }

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      type: "patient",
      text: "Nouveau patient enregistré : Ahmed Mohamed",
      time: "Il y a 5 minutes",

      icon: "👤",
    },
    {
      id: 2,
      type: "urgence",
      text: "Nouvelle urgence au service des urgences",
      time: "Il y a 15 minutes",
      icon: "🚨",
    },
    {
      id: 3,
      type: "doctor",
      text: "Le docteur Sarah Ahmed a commencé son service",
      time: "Il y a 30 minutes",
      icon: "👩‍⚕️",
    },
  ]

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🏥</div>
            <span>Système de gestion des urgences</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div key={item.id} className="nav-item">
              <button
                className={`nav-link ${item.id === currentPage ? "active" : ""}`}
                onClick={() => handleNavigation(item)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Tableau de bord principal</h1>
          <p className="dashboard-subtitle">Bienvenue dans le système de gestion des urgences</p> 
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card patients">
            <div className="stat-header">
              <div className="stat-icon">👥</div>
            </div>
            <div className="stat-value">
              {loading ? <span className="loading"></span> : stats.patients.count.toLocaleString()}
            </div>
            <div className="stat-label">Total des patients</div>

            {!loading && (
              <div className={`stat-change ${stats.patients.change >= 0 ? "positive" : "negative"}`}>
                {stats.patients.change >= 0 ? "+" : ""}
               {stats.patients.change}% ce mois-ci

              </div>
            )}
          </div>

          <div className="stat-card doctors">
            <div className="stat-header">
              <div className="stat-icon">👨‍⚕️</div>
            </div>
            <div className="stat-value">{loading ? <span className="loading"></span> : stats.doctors.count}</div>
            <div className="stat-label">Médecins actifs</div>

            {!loading && (
              <div className={`stat-change ${stats.doctors.change >= 0 ? "positive" : "negative"}`}>
                {stats.doctors.change >= 0 ? "+" : ""}
                {stats.patients.change}% ce mois-ci
              </div>
            )}
          </div>

          <div className="stat-card ambulances">
            <div className="stat-header">
              <div className="stat-icon">🚑</div>
            </div>
            <div className="stat-value">{loading ? <span className="loading"></span> : stats.ambulances.count}</div>
            <div className="stat-label">Ambulances</div>

            {!loading && (
              <div className={`stat-change ${stats.ambulances.change >= 0 ? "positive" : "negative"}`}>
                {stats.ambulances.change >= 0 ? "+" : ""}
                {stats.patients.change}% ce mois-ci
              </div>
            )}
          </div>

          <div className="stat-card urgences">
            <div className="stat-header">
              <div className="stat-icon">🚨</div>
            </div>
            <div className="stat-value">{loading ? <span className="loading"></span> : stats.urgences.count}</div>
            <div className="stat-label">Urgences</div>

            {!loading && (
              <div className={`stat-change ${stats.urgences.change >= 0 ? "positive" : "negative"}`}>
                {stats.urgences.change >= 0 ? "+" : ""}
                {stats.patients.change}% ce mois-ci
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
           <h3 className="chart-title">Statistiques des patients et des visites</h3>
           <div className="chart-placeholder">📈 Le graphique sera affiché ici</div>

          </div>

          <div className="chart-card">
            <h3 className="chart-title">Répartition des services</h3>
            <div className="chart-placeholder">🍩 Le graphique circulaire sera affiché ici</div>

          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <h3 className="activity-title">Activités récentes</h3>
          <ul className="activity-list">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-text">{activity.text}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage