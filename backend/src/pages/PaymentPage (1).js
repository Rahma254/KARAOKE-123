import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { PRICING, ADMIN_CONFIG } from "../config/supabase";

const PaymentPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: PRICING.BASIC,
      duration: "1 hari",
      features: [
        "Akses 50 lagu populer",
        "Rekam hingga 3 lagu per hari",
        "Kualitas audio standar",
        "Fitur dasar karaoke",
      ],
      color: "#4caf50",
      icon: "fas fa-music",
    },
    {
      id: "premium",
      name: "Premium",
      price: PRICING.PREMIUM,
      duration: "30 hari",
      features: [
        "Akses semua lagu (unlimited)",
        "Rekam unlimited",
        "Kualitas audio HD",
        "Voice effects premium",
        "Download rekaman",
        "Prioritas customer service",
        "Akses tournament eksklusif",
      ],
      color: "#ff9800",
      icon: "fas fa-crown",
      popular: true,
    },
    {
      id: "vip",
      name: "VIP",
      price: PRICING.VIP,
      duration: "30 hari",
      features: [
        "Semua fitur Premium",
        "Upload lagu custom",
        "Personal vocal coach (1 sesi)",
        "Akses beta features",
        "Profile badge eksklusif",
        "Monthly exclusive content",
        "Priority tournament entry",
        "24/7 dedicated support",
      ],
      color: "#e91e63",
      icon: "fas fa-gem",
    },
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePayment = () => {
    const message = `Halo Admin, saya ingin berlangganan paket ${selectedPlan.name} (${selectedPlan.duration}) dengan harga Rp ${selectedPlan.price.toLocaleString()}.\n\nData Akun:\nNama: ${user.user_metadata?.full_name || user.email}\nEmail: ${user.email}\n\nMohon kirimkan detail pembayaran. Terima kasih!`;

    const whatsappUrl = `https://wa.me/6${ADMIN_CONFIG.PAYMENT_METHODS.WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    alert(
      `Permintaan berlangganan telah dikirim!\n\nAnda akan diarahkan ke WhatsApp admin untuk menyelesaikan pembayaran.\n\nMetode Pembayaran:\n• GoPay: ${ADMIN_CONFIG.PAYMENT_METHODS.GOPAY}\n• Transfer Bank (detail akan diberikan admin)\n\nSetelah pembayaran, akses premium akan diaktivasi dalam 1-24 jam.`,
    );
  };

  return (
    <div style={styles.container} className="fade-in">
      <div className="container">
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>👑 Upgrade ke Premium</h1>
          <p style={styles.subtitle}>
            Nikmati pengalaman karaoke terbaik dengan fitur-fitur eksklusif
          </p>
        </div>

        {/* Current Plan Status */}
        <div style={styles.currentPlan}>
          <div className="card" style={styles.statusCard}>
            <div style={styles.statusIcon}>
              <i className="fas fa-user"></i>
            </div>
            <div style={styles.statusContent}>
              <h3 style={styles.statusTitle}>Status Akun Saat Ini</h3>
              <p style={styles.statusText}>
                <strong>Free User</strong> - Akses terbatas
              </p>
              <div style={styles.statusFeatures}>
                <span style={styles.statusFeature}>
                  <i className="fas fa-check"></i> 10 lagu gratis per hari
                </span>
                <span style={styles.statusFeature}>
                  <i className="fas fa-times"></i> Rekam maksimal 1 lagu per
                  hari
                </span>
                <span style={styles.statusFeature}>
                  <i className="fas fa-times"></i> Tidak ada voice effects
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div style={styles.plansContainer}>
          <h2 style={styles.sectionTitle}>💎 Pilih Paket Berlangganan</h2>

          <div style={styles.plansGrid}>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={() => handleSelectPlan(plan)}
              />
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div style={styles.paymentMethods}>
          <h2 style={styles.sectionTitle}>💳 Metode Pembayaran</h2>

          <div style={styles.methodsGrid}>
            <PaymentMethodCard
              icon="fas fa-mobile-alt"
              title="GoPay"
              description="Transfer langsung ke nomor GoPay"
              number={ADMIN_CONFIG.PAYMENT_METHODS.GOPAY}
              color="#00AA13"
            />

            <PaymentMethodCard
              icon="fab fa-whatsapp"
              title="WhatsApp Konfirmasi"
              description="Hubungi admin untuk konfirmasi"
              number={ADMIN_CONFIG.PAYMENT_METHODS.WHATSAPP}
              color="#25D366"
            />

            <PaymentMethodCard
              icon="fas fa-university"
              title="Transfer Bank"
              description="Detail rekening dari admin"
              number="Hubungi admin"
              color="#1976D2"
            />
          </div>
        </div>

        {/* FAQ */}
        <div style={styles.faqSection}>
          <h2 style={styles.sectionTitle}>❓ Pertanyaan Umum</h2>

          <div style={styles.faqGrid}>
            <FAQCard
              question="Bagaimana cara berlangganan?"
              answer="Pilih paket, hubungi admin via WhatsApp, lakukan pembayaran, dan akses premium akan diaktivasi dalam 1-24 jam."
            />

            <FAQCard
              question="Apakah bisa refund?"
              answer="Refund dapat dilakukan dalam 3 hari pertama jika ada masalah teknis. Hubungi admin untuk proses refund."
            />

            <FAQCard
              question="Berapa lama proses aktivasi?"
              answer="Aktivasi premium dilakukan dalam 1-24 jam setelah konfirmasi pembayaran dari admin."
            />

            <FAQCard
              question="Apakah auto-renewal?"
              answer="Tidak ada auto-renewal. Anda perlu memperpanjang secara manual sebelum masa aktif berakhir."
            />
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && selectedPlan && (
          <PaymentModal
            plan={selectedPlan}
            onConfirm={handlePayment}
            onClose={() => {
              setShowPayment(false);
              setSelectedPlan(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const PlanCard = ({ plan, onSelect }) => (
  <div
    className="card"
    style={{
      ...styles.planCard,
      ...(plan.popular ? styles.popularPlan : {}),
    }}
  >
    {plan.popular && (
      <div style={styles.popularBadge}>
        <i className="fas fa-star"></i>
        Paling Populer
      </div>
    )}

    <div style={styles.planHeader}>
      <div style={{ ...styles.planIcon, color: plan.color }}>
        <i className={plan.icon}></i>
      </div>
      <h3 style={styles.planName}>{plan.name}</h3>
      <div style={styles.planPrice}>
        <span style={styles.currency}>Rp</span>
        <span style={styles.amount}>{plan.price.toLocaleString()}</span>
        <span style={styles.duration}>/{plan.duration}</span>
      </div>
    </div>

    <ul style={styles.planFeatures}>
      {plan.features.map((feature, index) => (
        <li key={index} style={styles.planFeature}>
          <i
            className="fas fa-check"
            style={{ ...styles.checkIcon, color: plan.color }}
          ></i>
          {feature}
        </li>
      ))}
    </ul>

    <button
      onClick={onSelect}
      className="btn btn-primary"
      style={{
        ...styles.selectButton,
        background: `linear-gradient(45deg, ${plan.color}, ${plan.color}dd)`,
      }}
    >
      <i className="fas fa-rocket"></i>
      Pilih {plan.name}
    </button>
  </div>
);

const PaymentMethodCard = ({ icon, title, description, number, color }) => (
  <div className="card" style={styles.methodCard}>
    <div style={{ ...styles.methodIcon, color }}>
      <i className={icon}></i>
    </div>
    <h4 style={styles.methodTitle}>{title}</h4>
    <p style={styles.methodDesc}>{description}</p>
    <div style={styles.methodNumber}>{number}</div>
  </div>
);

const FAQCard = ({ question, answer }) => (
  <div className="card" style={styles.faqCard}>
    <h4 style={styles.faqQuestion}>{question}</h4>
    <p style={styles.faqAnswer}>{answer}</p>
  </div>
);

const PaymentModal = ({ plan, onConfirm, onClose }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modal} className="card">
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>Konfirmasi Pembelian</h3>
        <button onClick={onClose} style={styles.closeButton}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div style={styles.modalContent}>
        <div style={styles.orderSummary}>
          <h4>Detail Pesanan</h4>
          <div style={styles.orderItem}>
            <span>
              Paket {plan.name} ({plan.duration})
            </span>
            <span>Rp {plan.price.toLocaleString()}</span>
          </div>
          <div style={styles.orderTotal}>
            <strong>Total: Rp {plan.price.toLocaleString()}</strong>
          </div>
        </div>

        <div style={styles.paymentInfo}>
          <h4>Informasi Pembayaran</h4>
          <div style={styles.paymentStep}>
            <div style={styles.stepNumber}>1</div>
            <div>Klik "Lanjut ke WhatsApp" di bawah</div>
          </div>
          <div style={styles.paymentStep}>
            <div style={styles.stepNumber}>2</div>
            <div>Chat admin untuk detail pembayaran</div>
          </div>
          <div style={styles.paymentStep}>
            <div style={styles.stepNumber}>3</div>
            <div>Lakukan pembayaran sesuai instruksi</div>
          </div>
          <div style={styles.paymentStep}>
            <div style={styles.stepNumber}>4</div>
            <div>Kirim bukti pembayaran ke admin</div>
          </div>
        </div>
      </div>

      <div style={styles.modalActions}>
        <button onClick={onClose} className="btn btn-secondary">
          Batal
        </button>
        <button onClick={onConfirm} className="btn btn-primary">
          <i className="fab fa-whatsapp"></i>
          Lanjut ke WhatsApp
        </button>
      </div>
    </div>
  </div>
);

const styles = {
  container: {
    paddingTop: "30px",
    paddingBottom: "40px",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "10px",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.1rem",
    opacity: 0.8,
  },
  currentPlan: {
    marginBottom: "50px",
  },
  statusCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "25px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  statusIcon: {
    fontSize: "3rem",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "5px",
  },
  statusText: {
    marginBottom: "15px",
    opacity: 0.8,
  },
  statusFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  statusFeature: {
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  plansContainer: {
    marginBottom: "50px",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: "30px",
  },
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },
  planCard: {
    padding: "30px 25px",
    textAlign: "center",
    position: "relative",
    transition: "transform 0.3s ease",
  },
  popularPlan: {
    border: "2px solid #ff9800",
    transform: "scale(1.05)",
  },
  popularBadge: {
    position: "absolute",
    top: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(45deg, #ff9800, #ff5722)",
    color: "white",
    padding: "5px 15px",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  planHeader: {
    marginBottom: "25px",
  },
  planIcon: {
    fontSize: "3rem",
    marginBottom: "15px",
  },
  planName: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "15px",
  },
  planPrice: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: "5px",
  },
  currency: {
    fontSize: "1rem",
    opacity: 0.8,
  },
  amount: {
    fontSize: "2.5rem",
    fontWeight: "700",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  duration: {
    fontSize: "1rem",
    opacity: 0.8,
  },
  planFeatures: {
    listStyle: "none",
    padding: 0,
    marginBottom: "30px",
    textAlign: "left",
  },
  planFeature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    fontSize: "0.95rem",
  },
  checkIcon: {
    fontSize: "0.9rem",
  },
  selectButton: {
    width: "100%",
    padding: "15px 20px",
    fontSize: "16px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  paymentMethods: {
    marginBottom: "50px",
  },
  methodsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  methodCard: {
    textAlign: "center",
    padding: "25px",
  },
  methodIcon: {
    fontSize: "2.5rem",
    marginBottom: "15px",
  },
  methodTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    marginBottom: "10px",
  },
  methodDesc: {
    opacity: 0.8,
    marginBottom: "15px",
  },
  methodNumber: {
    background: "rgba(255,255,255,0.1)",
    padding: "10px 15px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  faqSection: {
    marginBottom: "40px",
  },
  faqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  faqCard: {
    padding: "20px",
  },
  faqQuestion: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "10px",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  faqAnswer: {
    opacity: 0.8,
    lineHeight: 1.5,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: "20px",
  },
  modal: {
    maxWidth: "500px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "5px",
  },
  modalContent: {
    marginBottom: "25px",
  },
  orderSummary: {
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  orderTotal: {
    borderTop: "1px solid rgba(255,255,255,0.2)",
    paddingTop: "10px",
    textAlign: "right",
    fontSize: "1.1rem",
  },
  paymentInfo: {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "10px",
  },
  paymentStep: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "10px",
  },
  stepNumber: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: "600",
    minWidth: "25px",
  },
  modalActions: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
  },
};

export default PaymentPage;
