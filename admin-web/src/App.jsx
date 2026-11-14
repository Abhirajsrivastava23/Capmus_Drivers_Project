import React, { useState, useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import api from './services/api';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LandingWebsite from './pages/LandingWebsite';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import StudentVerificationPage from './pages/StudentVerificationPage';
import DriversVehiclesPage from './pages/DriversVehiclesPage';
import RidesMonitorPage from './pages/RidesMonitorPage';
import BookingsMonitorPage from './pages/BookingsMonitorPage';
import ComplaintsReportsPage from './pages/ComplaintsReportsPage';
import ReviewsModerationPage from './pages/ReviewsModerationPage';
import AuditLogsPage from './pages/AuditLogsPage';

function AdminDashboardContent({ onBackToWebsite }) {
  const { admin, loading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dataLoading, setDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for all admin collections
  const [overviewData, setOverviewData] = useState(null);
  const [students, setStudents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [
        overviewRes,
        studentsRes,
        vehiclesRes,
        ridesRes,
        bookingsRes,
        reportsRes,
        reviewsRes,
        auditRes,
      ] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/students'),
        api.get('/admin/vehicles'),
        api.get('/admin/rides'),
        api.get('/admin/bookings'),
        api.get('/admin/reports'),
        api.get('/admin/reviews'),
        api.get('/admin/audit-logs'),
      ]);

      setOverviewData(overviewRes.data);
      setStudents(studentsRes.data.students || []);
      setVehicles(vehiclesRes.data.vehicles || []);
      setRides(ridesRes.data.rides || []);
      setBookings(bookingsRes.data.bookings || []);
      setReports(reportsRes.data.reports || []);
      setReviews(reviewsRes.data.reviews || []);
      setAuditLogs(auditRes.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchData();
      const interval = setInterval(() => {
        fetchData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#071120] flex items-center justify-center text-white font-medium">
        Loading Campus Drivers Admin...
      </div>
    );
  }

  if (!admin) {
    return <LoginPage onBackToWebsite={onBackToWebsite} />;
  }

  const tabTitles = {
    overview: { title: 'Executive Overview', subtitle: 'Chandigarh University UP Carpool Metrics & Activity' },
    students: { title: 'Student ID Verification', subtitle: 'Review and approve submitted student identification cards' },
    vehicles: { title: 'Drivers & UP Vehicles', subtitle: 'Manage student drivers, vehicle registrations, and RC records' },
    rides: { title: 'Rides Monitor', subtitle: 'Real-time observation of scheduled and active campus journeys' },
    bookings: { title: 'Bookings & Seats', subtitle: 'Inspect passenger reservations and declared expense sharing' },
    reports: { title: 'Safety & Complaints Desk', subtitle: 'Manage incidents, unsafe driving reports, and emergency actions' },
    reviews: { title: 'Reviews & Driver Ratings', subtitle: 'Audit 5-star driving experience scores and moderate feedback' },
    audit: { title: 'System Security Audit Logs', subtitle: 'Forensic records of all administrative operations and changes' },
  };

  const currentHeader = tabTitles[activeTab] || tabTitles.overview;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBackToWebsite={onBackToWebsite}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Navbar
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
          onBackToWebsite={onBackToWebsite}
        />

        <main className="p-8 flex-1">
          {dataLoading ? (
            <div className="py-20 text-center text-slate-400 font-medium">
              Loading administration data...
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <DashboardOverview
                  metrics={overviewData?.metrics}
                  recentRides={overviewData?.recentRides}
                  recentReports={overviewData?.recentReports}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'students' && (
                <StudentVerificationPage students={students} onRefresh={fetchData} />
              )}
              {activeTab === 'vehicles' && (
                <DriversVehiclesPage vehicles={vehicles} onRefresh={fetchData} />
              )}
              {activeTab === 'rides' && (
                <RidesMonitorPage rides={rides} />
              )}
              {activeTab === 'bookings' && (
                <BookingsMonitorPage bookings={bookings} />
              )}
              {activeTab === 'reports' && (
                <ComplaintsReportsPage reports={reports} onRefresh={fetchData} />
              )}
              {activeTab === 'reviews' && (
                <ReviewsModerationPage reviews={reviews} onRefresh={fetchData} />
              )}
              {activeTab === 'audit' && (
                <AuditLogsPage logs={auditLogs} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      if (search.get('view') === 'admin' || window.location.pathname.startsWith('/admin')) {
        return 'admin';
      }
    }
    return 'website';
  });

  const handleOpenAdmin = () => {
    setViewMode('admin');
    if (typeof window !== 'undefined' && window.history) {
      if (window.location.search.indexOf('view=admin') === -1) {
        window.history.pushState({}, '', '?view=admin');
      }
    }
  };

  const handleBackToWebsite = () => {
    setViewMode('website');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/');
    }
  };

  // Sync with browser navigation and popstate
  useEffect(() => {
    const handlePopState = () => {
      const search = new URLSearchParams(window.location.search);
      if (search.get('view') === 'admin' || window.location.pathname.startsWith('/admin')) {
        setViewMode('admin');
      } else {
        setViewMode('website');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ⌨️ Global Shortcut: Ctrl+C and Cmd+C (Capture phase) opens Admin Portal
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isC =
        e.key === 'c' ||
        e.key === 'C' ||
        e.key === '\u0003' ||
        e.code === 'KeyC' ||
        e.keyCode === 67 ||
        e.which === 67;

      const isModifier = e.ctrlKey || e.metaKey;

      if (isModifier && isC) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        const isInput =
          activeTag === 'input' ||
          activeTag === 'textarea' ||
          document.activeElement?.isContentEditable;

        if (!isInput) {
          e.preventDefault();
          e.stopPropagation();
          handleOpenAdmin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  if (viewMode === 'website') {
    return <LandingWebsite onOpenAdmin={handleOpenAdmin} />;
  }

  return (
    <AdminAuthProvider>
      <AdminDashboardContent onBackToWebsite={handleBackToWebsite} />
    </AdminAuthProvider>
  );
}
