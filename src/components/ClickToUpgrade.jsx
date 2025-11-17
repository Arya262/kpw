import React, { useState, cloneElement } from 'react';
import { usePlanPermissions } from '../hooks/usePlanPermissions';
import PlansModal from '../features/dashboard/PlansModal';

const ClickToUpgrade = ({ 
  children, 
  permission, 
  className = "",
  disabled = false,
  usersMatrix = []
}) => {
  const { checkPermission, userPlan, permissions } = usePlanPermissions(usersMatrix);
  const [showPlansModal, setShowPlansModal] = useState(false);
  
  if (checkPermission(permission)) {
    return children;
  }

  // If no permission, clone the child element and override its onClick
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log('Upgrade button clicked');
    if (!disabled) {
      // console.log('Showing plans modal');
      setShowPlansModal(true);
    }
  };

  // Clone the child element and override its onClick handler
  const clonedChild = React.cloneElement(children, {
    onClick: handleClick,
    title: "Upgrade to unlock this feature",
    style: { cursor: 'pointer' },
    // Ensure the button is not disabled when we want to show the upgrade modal
    disabled: false
  });

  // console.log('Rendering ClickToUpgrade, showPlansModal:', showPlansModal);
  
  return (
    <>
      <div className={className} onClick={handleClick}>
        {clonedChild}
      </div>
      
      {showPlansModal && (
        <PlansModal
          isOpen={showPlansModal}
          onClose={() => setShowPlansModal(false)}
          onPay={() => {}}
          userPlan={userPlan}
        />
      )}
    </>
  );
};

export default ClickToUpgrade;
