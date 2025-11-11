import React, { useState, cloneElement } from 'react';
import { usePlanPermissions } from '../hooks/usePlanPermissions';
import PlansModal from '../features/dashboard/PlansModal';
import { usePayment } from '../hooks/usePayment';

const ClickToUpgrade = ({ 
  children, 
  permission, 
  className = "",
  disabled = false,
  usersMatrix = []
}) => {
  const { checkPermission, userPlan, permissions } = usePlanPermissions(usersMatrix);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const { handlePayment } = usePayment();

  if (checkPermission(permission)) {
    return children;
  }


  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setShowPlansModal(true);
    }
  };

  
  const clonedChild = React.cloneElement(children, {
    onClick: handleClick,
    title: "Upgrade to unlock this feature",
    style: { cursor: 'pointer' },
    disabled: false
  });
  
  return (
    <>
      <div className={className} onClick={handleClick}>
        {clonedChild}
      </div>
      
      {showPlansModal && (
        <PlansModal
          isOpen={showPlansModal}
          onClose={() => setShowPlansModal(false)}
          onPay={handlePayment}
          userPlan={userPlan}
          onStartTrial={null} // No trial start functionality in ClickToUpgrade
        />
      )}
    </>
  );
};

export default ClickToUpgrade;
