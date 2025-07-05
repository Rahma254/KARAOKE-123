import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  songService,
  performanceService,
  tournamentService,
} from "../services/database";
import SongUploader from "./SongUploader";
import TournamentManager from "./TournamentManager";
import PaymentManager from "./PaymentManager";

const AdminDashboard = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalUsers: 0,
    totalPerformances: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      // Load various statistics
      const songs = await songService.getAllSongs();
      const performances = await performanceService.getLeaderboard(100);

      setStats({
        totalSongs: songs.length,
        totalUsers: 150, // Mock data
        totalPerformances: performances.length,
        revenue: 2500000, // Mock revenue in IDR
      });

      // Load recent activity
      setRecentActivity([
        {
          type: "song",
          action: "Upload lagu baru",
          details: "Perfect - Ed Sheeran",
          time: "2 jam lalu",
        },
        {
          type: "user",
          action: "User baru terdaftar",
          details: "John Doe",
          time: "3 jam lalu",
        },
        {
          type: "tournament",
          action: "Tournament dimulai",
          details: "Weekly Challenge #5",
          time: "5 jam lalu",
        },
        {
          type: "payment",
          action: "Pembayaran diterima",
          details: "Rp 15.000 - Premium Plan",
          time: "1 hari lalu",
        },
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  if (!isAdmin) {
    return (
      <div style={styles.container} className="fade-in">
        <div className="container">
          <div style={styles.noAccess}>
            <i className="fas fa-shield-alt" style={styles.noAccessIcon}></i>
            <h2>Akses Ditolak</h2>
            <p>Anda tidak memiliki akses admin untuk halaman ini.</p>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate("home")}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Dashboard", icon: "fas fa-chart-line" },
    { id: "songs", label: "Kelola Lagu", icon: "fas fa-music" },
    { id: "tournaments", label: "Tournament", icon: "fas fa-trophy" },
    { id: "payments", label: "Pembayaran", icon: "fas fa-credit-card" },
    { id: "users", label: "Users", icon: "fas fa-users" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab stats={stats} recentActivity={recentActivity} />;
      case "songs":
        return <SongUploader />;
      case "tournaments":
        return <TournamentManager />;
      case "payments":
        return <PaymentManager />;
      case "users":
        return <UsersTab />;
      default:
        return <OverviewTab stats={stats} recentActivity={recentActivity} />;
    }
  };

  return (
    <div style={styles.container} className="fade-in">
      <div className="container">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🛡️ Admin Dashboard</h1>
            <p style={styles.subtitle}>Nabila Portal Karaoke - Panel Kontrol</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate("home")}
            style={styles.backButton}
          >
            <i className="fas fa-arrow-left"></i>
            Kembali
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? "btn-primary" : "btn-secondary"}`}
              style={styles.tabButton}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>{renderTabContent()}</div>
      </div>
    </div>
  );
};

const OverviewTab = ({ stats, recentActivity }) => (
  <div>
    {/* Stats Grid */}
    <div style={styles.statsGrid}>
      <StatCard
        icon="fas fa-music"
        title="Total Lagu"
        value={stats.totalSongs}
        color="#ff6b6b"
      />
      <StatCard
        icon="fas fa-users"
        title="Total Users"
        value={stats.totalUsers}
        color="#feca57"
      />
      <StatCard
        icon="fas fa-microphone"
        title="Performances"
        value={stats.totalPerformances}
        color="#48dbfb"
      />
      <StatCard
        icon="fas fa-money-bill-wave"
        title="Revenue"
        value={`Rp ${stats.revenue.toLocaleString()}`}
        color="#ff9ff3"
      />
    </div>

    {/* Recent Activity */}
    <div style={styles.activitySection}>
      <h3 style={styles.sectionTitle}>Aktivitas Terbaru</h3>
      <div style={styles.activityList}>
        {recentActivity.map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        ))}
      </div>
    </div>
  </div>
);

const UsersTab = () => (
  <div>
    <h3 style={styles.sectionTitle}>Manajemen Users</h3>
    <div className="card" style={styles.comingSoon}>
      <i className="fas fa-users" style={styles.comingSoonIcon}></i>
      <h4>Coming Soon</h4>
      <p>Fitur manajemen users sedang dalam pengembangan</p>
    </div>
  </div>
);

const StatCard = ({ icon, title, value, color }) => (
  <div className="card" style={styles.statCard}>
    <div style={{ ...styles.statIcon, color }}>
      <i className={icon}></i>
    </div>
    <div style={styles.statContent}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "song":
        return "fas fa-music";
      case "user":
        return "fas fa-user-plus";
      case "tournament":
        return "fas fa-trophy";
      case "payment":
        return "fas fa-credit-card";
      default:
        return "fas fa-info-circle";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "song":
        return "#ff6b6b";
      case "user":
        return "#feca57";
      case "tournament":
        return "#48dbfb";
      case "payment":
        return "#ff9ff3";
      default:
        return "#9e9e9e";
    }
  };

  return (
    <div style={styles.activityItem}>
      <div
        style={{
          ...styles.activityIcon,
          color: getActivityColor(activity.type),
        }}
      >
        <i className={getActivityIcon(activity.type)}></i>
      </div>
      <div style={styles.activityContent}>
        <div style={styles.activityAction}>{activity.action}</div>
        <div style={styles.activityDetails}>{activity.details}</div>
      </div>
      <div style={styles.activityTime}>{activity.time}</div>
    </div>
  );
};

const styles = {
  container: {
    paddingTop: "30px",
    paddingBottom: "40px",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "5px",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.1rem",
    opacity: 0.8,
  },
  backButton: {
    padding: "10px 20px",
  },
  noAccess: {
    textAlign: "center",
    padding: "60px 20px",
  },
  noAccessIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
    opacity: 0.5,
  },
  tabsContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  tabButton: {
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  tabContent: {
    minHeight: "500px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
  },
  statIcon: {
    fontSize: "2.5rem",
    minWidth: "60px",
    textAlign: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "5px",
  },
  statTitle: {
    fontSize: "0.9rem",
    opacity: 0.7,
  },
  activitySection: {
    marginTop: "40px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "20px",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
  },
  activityIcon: {
    fontSize: "1.5rem",
    minWidth: "40px",
    textAlign: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontWeight: "500",
    marginBottom: "3px",
  },
  activityDetails: {
    fontSize: "0.9rem",
    opacity: 0.7,
  },
  activityTime: {
    fontSize: "0.8rem",
    opacity: 0.6,
  },
  comingSoon: {
    textAlign: "center",
    padding: "60px 20px",
  },
  comingSoonIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
    opacity: 0.5,
  },
};

export default AdminDashboard;
