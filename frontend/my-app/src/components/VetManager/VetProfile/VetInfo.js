import React from 'react';
import InfoItem from './InfoItem';
import styles from './VetProfile.module.css';

const VetInfo = ({ vet }) => {
  return (
    <div className={styles.infoSection}>
      <h3>{vet.clinicName}</h3>
      <InfoItem label="Veterinarian" value={vet.vetName} />
      <InfoItem label="Address" value={vet.address?.street} />
      <InfoItem 
        label="Location" 
        value={`${vet.address?.city || ''}, ${vet.address?.zipCode || ''}`} 
      />
      <InfoItem label="Email" value={vet.contactInfo?.email} />
      <InfoItem label="Phone" value={vet.contactInfo?.phone} />
    </div>
  );
};

export default VetInfo;