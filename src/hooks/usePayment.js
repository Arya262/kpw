import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';

export const usePayment = () => {
  const { user } = useAuth();
  const [paymentLoading, setPaymentLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        )
      ) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (paymentDetails) => {
    if (!user?.customer_id) {
      throw new Error('User not authenticated');
    }

    setPaymentLoading(true);

    try {
      const amountInRupees = parseFloat(paymentDetails.totalPrice || 0);

      const res = await loadRazorpayScript();
      if (!res) {
        const error = new Error("Razorpay SDK failed to load.");
        toast.error(error.message);
        throw error;
      }

      if (isNaN(amountInRupees) || amountInRupees <= 0) {
        const error = new Error("Please enter a valid amount.");
        toast.error(error.message);
        throw error;
      }

      const orderRes = await fetch(API_ENDPOINTS.RAZORPAY.CREATE_ORDER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInRupees,
          customer_id: user.customer_id,
          plan: paymentDetails?.plan,
          billing_cycle: paymentDetails?.billingCycle,
          addon_enabled: paymentDetails?.addonEnabled,
          flows: paymentDetails?.flows,
        }),
      });

      const { order } = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: user?.company_name || "FoodChow",
        image: user?.company_logo || undefined,
        description: paymentDetails ? `Subscribe to ${paymentDetails.plan} Plan` : "Add Credit",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(API_ENDPOINTS.RAZORPAY.VERIFY_PAYMENT, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: paymentDetails?.plan,
                billing_cycle: paymentDetails?.billingCycle,
                addon_enabled: paymentDetails?.addonEnabled,
                flows: paymentDetails?.flows,
                amount: amountInRupees,
              }),
            });

            if (!verifyRes.ok) {
              const errorData = await verifyRes.json().catch(() => ({}));
              throw new Error(errorData.message || 'Payment verification failed');
            }

            const successMsg = paymentDetails ? 'Payment successful! Your plan has been updated.' : 'Payment successful! Credits added.';
            toast.success(successMsg);
            
            // Refresh the page to update user data
            window.location.reload();
          } catch (err) {
            console.error('Payment verification error:', err);
            toast.error(err.message || 'Payment verification failed');
            throw err;
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: "#0AA89E" },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Payment initiation failed');
      setPaymentLoading(false);
      throw err;
    }
  };

  return {
    handlePayment,
    paymentLoading
  };
};
