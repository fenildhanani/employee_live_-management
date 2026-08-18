import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import Notification from '../../components/Notification';

const SubscriptionAdmin = () => {
  const [subStatus, setSubStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState('');
  const [msg, setMsg] = useState('');

  const loadSubscription = async () => {
    try {
      const res = await api.get('/subscription/status');
      setSubStatus(res.data.data);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const handleChoosePlan = async (planName) => {
    setProcessingPlan(planName);
    setMsg('');
    try {
      const res = await api.post('/subscription/checkout', { planName });
      if (res.data.data?.url) {
        window.location.href = res.data.data.url;
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Subscription checkout failed');
    } finally {
      setProcessingPlan('');
    }
  };

  if (loading) return <Loading message="Loading subscription plans..." />;

  const plans = [
    { name: 'Free', price: '$0', limit: 'Up to 5 Employees', features: ['Basic Leave Tracking', 'Standard Support'] },
    { name: 'Basic', price: '$49', limit: 'Up to 25 Employees', features: ['Full Leave Module', 'Attendance & Comp-Off', 'Email Support'] },
    { name: 'Professional', price: '$99', limit: 'Up to 100 Employees', features: ['Advanced Analytics', 'Expense Claims', 'Priority Support'], popular: true },
    { name: 'Enterprise', price: '$299', limit: 'Unlimited Employees', features: ['Stripe Billing Integration', 'Google & Outlook Sync', 'Custom HR Workflows'] }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center max-w-2xl mx-auto mb-4">
        <h3 className="fw-bold text-primary mb-1">Stripe SaaS Subscription Billing</h3>
        <p className="text-muted small">Choose the best subscription plan for your organization size and workflow needs.</p>
        <div className="d-inline-flex align-items-center gap-2 bg-light border p-2 px-3 rounded-pill">
          <span className="small text-muted">Current Plan:</span>
          <span className="badge bg-primary text-uppercase">{subStatus?.plan || 'Professional'}</span>
          <span className="badge bg-success text-uppercase">{subStatus?.status || 'Active'}</span>
        </div>
      </div>

      <Notification type="info" message={msg} onClose={() => setMsg('')} />

      <div className="row g-4 align-items-stretch">
        {plans.map((p) => {
          const isCurrent = subStatus?.plan === p.name;
          return (
            <div key={p.name} className="col-12 col-md-6 col-xl-3">
              <div className={`glass-card p-4 h-100 d-flex flex-column justify-content-between position-relative ${p.popular ? 'border-primary border-2 shadow-lg' : ''}`}>
                {p.popular && (
                  <span className="position-absolute top-0 start-50 translate-middle badge bg-primary px-3 py-1">
                    MOST POPULAR
                  </span>
                )}
                <div>
                  <h5 className="fw-bold text-primary mb-1">{p.name}</h5>
                  <div className="fs-2 fw-bold text-dark my-2">
                    {p.price} <span className="fs-6 text-muted font-normal">/ month</span>
                  </div>
                  <div className="small fw-semibold text-secondary mb-3">{p.limit}</div>
                  <ul className="list-unstyled extra-small space-y-2 text-muted">
                    {p.features.map((f, i) => (
                      <li key={i} className="d-flex align-items-center gap-2">
                        <i className="bi bi-check-circle-fill text-success"></i> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    className={`btn w-100 fw-bold ${isCurrent ? 'btn-outline-success' : p.popular ? 'btn-primary' : 'btn-outline-primary'}`}
                    disabled={isCurrent || processingPlan === p.name}
                    onClick={() => handleChoosePlan(p.name)}
                  >
                    {isCurrent ? 'Current Plan' : processingPlan === p.name ? 'Redirecting...' : 'Upgrade Plan'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionAdmin;
